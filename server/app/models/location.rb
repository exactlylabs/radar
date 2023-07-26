require "#{Rails.root}/lib/fips/fips_geocoder.rb"
require "csv"

class Location < ApplicationRecord
include EventSourceable

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

  after_validation :custom_geocode, if: :lat_long_changed?
  after_save :link_to_geospaces
  after_save :send_notifications

  default_scope { where(deleted_at: nil) }
  scope :with_deleted, -> { unscope(where: :deleted_at) }
  scope :where_online, -> { where(online: true) }

  scope :where_offline, -> { where(online: false) }

  scope :where_has_client_associated, -> { joins(:clients).where("clients.location_id IS NOT NULL").distinct }

  scope :with_geospaces,  -> { joins("JOIN geospaces ON ST_INTERSECTS(ST_SetSRID(locations.lonlat, 4326)::geometry, ST_SetSRID(geospaces.geom, 4326)::geometry)") }

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
    self.measurements.order(created_at: :desc).first
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

  def recalculate_averages!
    measurements = self.measurements.where(account_id: self.account.id)
    if measurements.count > 0
      self.download_avg = measurements.average(:download).to_f.round(3) if self.measurements.count.positive?
      self.upload_avg = measurements.average(:upload).to_f.round(3) if self.measurements.count.positive?
    else
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
      RecentSearch.where(location_id: self.id).destroy_all
    end
  end

  def self.update_online_status!()
    # Go through all locations and update their online/offline status + other metadata
    Location.joins(:clients).group("locations.id").having("BOOL_OR(clients.online)").where("clients.in_service = true AND (offline_since IS NOT NULL OR locations.online = false)").update(online: true, offline_since: nil)
    Location.joins(:clients).group(:id).having("BOOL_AND(NOT clients.online)").where("clients.in_service = true AND locations.offline_since IS NULL AND locations.online = true").each do |location|
      offline_since = Event.from_aggregate(location.clients).where_name_is(Client::Events::WENT_OFFLINE).last&.timestamp
      location.offline_since = offline_since || location.created_at
      if location.offline_since.before? 1.hour.ago
        location.online = false
      end
      location.save!
    end
    Location.where("offline_since < ? AND online=true", 1.hour.ago).update(online: false)
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

  private

  def custom_geocode
    # if the location entity had no lat/long, then geocode based
    # on address, else, always stick to given lat/long values.
    if !self.longitude && !self.latitude
      results = Geocoder.search(self.address)
    else
      results = Geocoder.search([self.latitude, self.longitude])
    end
    if geo = results.first
      self.state_fips, self.county_fips = FipsGeocoderCli::get_fips_codes geo.latitude, geo.longitude
      self.latitude = geo.latitude unless self.latitude
      self.longitude = geo.longitude unless self.longitude
      self.state = geo.state
      self.county = geo.county
      self.lonlat = "POINT(#{geo.longitude} #{geo.latitude})"
    end
  end

  def link_to_geospaces
    if saved_change_to_lonlat? && self.lonlat.present?
      self.geospaces.excluding_lonlat(self.lonlat).each do |geospace|
        self.geospaces.delete geospace
      end
      Geospace.containing_lonlat(self.lonlat).each do |geospace|
        self.geospaces << geospace unless self.geospaces.include? geospace
      end
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
