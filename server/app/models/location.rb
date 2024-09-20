require "#{Rails.root}/lib/fips/fips_geocoder.rb"
require "csv"

class Location < ApplicationRecord
include EventSourceable
include Recents
include Schedulable

  LOCATIONS_PER_COUNTY_GOAL = 25
  LOCATIONS_PER_PLACE_GOAL = 3
  LOCATIONS_PER_ISP_PER_COUNTY_GOAL = 3

  module Events
    NAME_CHANGED = "NAME_CHANGED"
    ADDRESS_CHANGED = "ADDRESS_CHANGED"
    LABEL_ADDED = "LABEL_ADDED"
    LABEL_REMOVED = "LABEL_REMOVED"
    DELETED = "DELETED"
    RESTORED = "RESTORED"
    WENT_ONLINE = "LOCATION_WENT_ONLINE"
    WENT_OFFLINE = "LOCATION_WENT_OFFLINE"
    CATEGORY_ADDED = "CATEGORY_ADDED"
    CATEGORY_REMOVED = "CATEGORY_REMOVED"
    ACCOUNT_CHANGED = "NETWORK_ACCOUNT_CHANGED"
    DATA_MIGRATION_REQUESTED = "DATA_MIGRATION_REQUESTED"
  end

  # Event Hooks
  on_create applier: :apply_on_create, event_data: :event_data
  notify_change :name, Location::Events::NAME_CHANGED
  notify_change :address, Location::Events::ADDRESS_CHANGED
  notify_change :online, {false => Location::Events::WENT_OFFLINE, true => Location::Events::WENT_ONLINE}
  notify_change :deleted_at, {nil => Location::Events::RESTORED, :default => Location::Events::DELETED}
  notify_change :account_id, Location::Events::ACCOUNT_CHANGED

  validates :name, :address, presence: true

  belongs_to :user, foreign_key: 'created_by_id', optional: true
  belongs_to :account
  belongs_to :location_group, optional: true
  belongs_to :account
  has_and_belongs_to_many :categories,
    # Note: Rails only triggers when associating through << statement
    # See: https://guides.rubyonrails.org/association_basics.html#association-callbacks
    after_add: :after_category_added,
    after_remove: :after_category_removed
  has_many :measurements, dependent: :nullify
  has_many :clients, dependent: :nullify
  has_one :client_count_aggregate, :as => :aggregator
  has_and_belongs_to_many :geospaces
  has_one :location_metadata_projections
  belongs_to :scheduling_selected_client, class_name: "Client", optional: true

  before_validation :check_if_only_coordinates
  after_validation :custom_geocode, if: Proc.new { new_record? || address_changed? || latitude_changed? || longitude_changed? }
  after_save_commit :link_to_geospaces
  after_commit :send_notifications
  after_save :handle_account_change, if: :saved_change_to_account_id?

  default_scope { where(deleted_at: nil) }
  scope :with_deleted, -> { unscope(where: :deleted_at) }
  scope :where_online, -> { where(online: true) }

  scope :where_offline, -> { where(online: false) }

  scope :where_has_client_associated, -> { joins(:clients).where("clients.location_id IS NOT NULL").distinct }

  scope :with_geospaces,  -> { joins("JOIN geospaces ON ST_CONTAINS(ST_SetSRID(geospaces.geom, 4326), locations.lonlat::geometry)") }

  def event_data()
    data = self.as_json.transform_keys(&:to_sym)
    data["labels"] = self.categories.map {|label| label.name}
    return data
  end

  def apply_on_create(state, event)
    state.update({
      name: self.name,
      address: self.address,
      labels: self.categories.map {|label| label.name},
      account_id: self.account_id,
    })
  end

  def after_category_added(category)
    event_data = {
      id: category.id,
    }
    self.record_event Location::Events::CATEGORY_ADDED, event_data, Time.now do |state, event|
      state["categories"] ||= []
      state["categories"] << category.name
    end
  end

  def after_category_removed(category)
    event_data = {
      id: category.id,
    }
    self.record_event Location::Events::CATEGORY_REMOVED, event_data, Time.now do |state, event|
       # doing nested if for a bit better readability
      if state["categories"].present? && state["categories"].include?(category.name)
        state["categories"].delete(category.name)
      end
    end
  end

  # Create helper method as using [:symbol_1, :symbol_2] only runs
  # if and only if both are true, and we need an OR condition in this case
  # Plus, it's a bit more understandable
  def lat_long_changed?
    will_save_change_to_latitude? || will_save_change_to_longitude?
  end

  def latest_download
    latest_measurement ? latest_measurement.download : nil
  end

  def latest_upload
    latest_measurement ? latest_measurement.upload : nil
  end

  def latest_measurement
    measurements.order(created_at: :desc).where('download IS NOT NULL AND upload IS NOT NULL').first
  end

  def diff_to_human(diff, expected_value)
    sign = diff > 0 ? "+" : "" # Don't need the - for negative values as it will come in the actual calculation
    rounded_percentage = ((diff / expected_value) * 100).round(2)
    "#{sign}#{rounded_percentage}%"
  end

  def download_diff(calculated_avg = nil)
    if calculated_avg == -1
      return "-"
    end
    avg = calculated_avg.present? ? calculated_avg : self.download_avg
    if avg.nil? || self.expected_mbps_down.nil?
      return nil
    end
    diff = avg - self.expected_mbps_down
    diff_to_human(diff, self.expected_mbps_down)
  end

  def upload_diff(calculated_avg = nil)
    if calculated_avg == -1
      return "-"
    end
    avg = calculated_avg.present? ? calculated_avg : self.upload_avg
    if avg.nil? || self.expected_mbps_up.nil?
      return nil
    end
    diff = avg - self.expected_mbps_up
    diff_to_human(diff, self.expected_mbps_up)
  end

  def process_new_measurement!(measurement)
    query = %{
      UPDATE locations SET
        measurements_count = measurements_count + 1,
        measurements_download_sum = measurements_download_sum + :download,
        measurements_upload_sum = measurements_upload_sum + :upload,
        download_avg = (measurements_download_sum + :download) / (measurements_count + 1),
        upload_avg = (measurements_upload_sum + :upload) / (measurements_count + 1)
      WHERE id = :location_id
    }
    ActiveRecord::Base.connection.execute(
      ApplicationRecord.sanitize_sql([query, {
        download: measurement.download,
        upload: measurement.upload,
        location_id: self.id
      }])
    )
    self.compute_test!(measurement.download_total_bytes + measurement.upload_total_bytes)
  end

  def handle_account_change
    reassign_pods
    recalculate_averages!
  end

  def reassign_pods
    self.clients.update_all(account_id: self.account_id)
  end

  def recalculate_averages!
    model = Measurement.arel_table
    measurements = self.measurements.where(account_id: self.account.id)
    count, download, upload = measurements.pluck(model[:id].count, model[:download].sum, model[:upload].sum).first

    if count > 0
      self.lock!
      self.measurements_count = count
      self.measurements_download_sum = download
      self.measurements_upload_sum = upload
      self.download_avg = (self.measurements_download_sum / count).round(3)
      self.upload_avg = (self.measurements_upload_sum / count).round(3)
    else
      self.measurements_count = 0
      self.measurements_download_sum = 0
      self.measurements_upload_sum = 0
      self.download_avg = nil
      self.upload_avg = nil
    end
    self.save!
  end

  def self.to_csv_enumerator
    @enumerator = Enumerator.new do |yielder|
      yielder << CSV.generate_line(%w{id name address latitude longitude user_id created_at(UTC+0) expected_mbps_up expected_mbps_down state county manual_lat_long state_fips county_fips automatic_location})
      includes(:user).find_each do |location|
        yielder << CSV.generate_line([
          location.id,
          location.name,
          location.address,
          location.latitude,
          location.longitude,
          location.user ? location.user.id : "",
          location.created_at.strftime("%m/%d/%Y %H:%M:%S"),
          location.expected_mbps_up,
          location.expected_mbps_down,
          location.state,
          location.county,
          location.manual_lat_long,
          location.state_fips,
          location.county_fips,
          location.automatic_location
        ])
      end
    end
  end

  def self.to_csv_file()
    tmp_file = Tempfile.new("locations.csv")
    File.open(tmp_file.path, 'w') do |file|
      to_csv_enumerator.each_with_index do |line, index|
        file.write(line)
      end
    end
    tmp_file
  end

  def soft_delete
    ActiveRecord::Base.transaction do
      self.deleted_at = Time.now
      self.save!
      self.clients.update(location_id: nil)
      CategoriesLocation.where(location_id: self.id).destroy_all
      remove_recent_search(self.id, Recents::RecentTypes::LOCATION)
    end
  end

  def self.update_online_status!()
    # Go through all locations and update their online/offline status + other metadata
    Location.joins(:clients).group("locations.id").having("BOOL_OR(clients.online)").where("offline_since IS NOT NULL OR locations.online = false").update(online: true, offline_since: nil)
    Location.left_outer_joins(:clients).group("locations.id").having("BOOL_AND(NOT COALESCE(clients.online, false))").where("locations.offline_since IS NULL AND locations.online = true").each do |location|
      offline_since = Event.from_aggregate(location.clients).where_name_is(Client::Events::WENT_OFFLINE).last&.timestamp
      location.update(online: false, offline_since: offline_since || location.created_at)
    end
  end

  def update_status!()
    has_online_pods = self.clients.where(online: true).count > 0
    if !online? && has_online_pods
      self.update(online: true, offline_since: nil)
    elsif online? && !has_online_pods
      offline_since = Event.from_aggregate(self.clients).where_name_is(Client::Events::WENT_OFFLINE).last&.timestamp
      self.update(online: false, offline_since: offline_since || self.created_at)
    end
  end

  def study_state?
    self.state_geospace&.study_geospace
  end

  def study_county?
    self.county_geospace&.study_geospace
  end

  def state_geospace
    self.geospaces.states.first
  end

  def county_geospace
    self.geospaces.counties.first
  end

  def place_geospace
    self.geospaces.census_places.first
  end

  def autonomous_system
    self.clients.map(&:autonomous_system).compact.first
  end

  private

  # This covers the case in which a user might create/update a network and only manually set
  # values for lat/lng, but no explicit address in the corresponding input. In this case, we
  # want to make sure that the address is set based on the given lat/lng values before running
  # address existence validations.
  def check_if_only_coordinates
    return if self.address.present?
    return if self.latitude.blank? || self.longitude.blank?
    result = Geocoder.search([self.latitude, self.longitude])
    return if result.empty?
    self.address = result.first.address
  end

  def custom_geocode
    # if the location entity had no lat/long, then geocode based
    # on address, else, always stick to given lat/long values.
    if !self.longitude && !self.latitude
      results = Geocoder.search(self.address)
    else
      results = Geocoder.search([self.latitude, self.longitude])
    end
    if geo = results.first
      self.latitude = geo.latitude unless self.latitude
      self.longitude = geo.longitude unless self.longitude
      self.state = geo.state
      self.county = geo.county
      self.lonlat = "POINT(#{geo.longitude} #{geo.latitude})"
    end
  end

  def link_to_geospaces
    if lonlat.present? && (previous_changes.blank? || saved_change_to_lonlat? )
      ReprocessNetworkGeospaceJob.perform_later(self)
    end
  end

  def send_notifications
    if saved_change_to_online?
      if self.online
        LocationNotificationJobs::NotifyLocationOnline.perform_later self, Time.now
      # else # Deactivated for now due too noisy alerts
      #   LocationNotificationJobs::NotifyLocationOffline.perform_later self, self.offline_since
      end
    end

  end

end
