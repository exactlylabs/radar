require "#{Rails.root}/lib/fips/fips_geocoder.rb"
require "csv"

class Location < ApplicationRecord
include EventSourceable

  module Events
    NAME_CHANGED = "NAME_CHANGED"
    ADDRESS_CHANGED = "ADDRESS_CHANGED"
    LABEL_ADDED = "LABEL_ADDED"
    LABEL_REMOVED = "LABEL_REMOVED"
  end


  # Event Hooks
  on_create applier: :apply_on_create, event_data: :event_data
  notify_change :name, Location::Events::NAME_CHANGED
  notify_change :address, Location::Events::ADDRESS_CHANGED

  validates :name, :address, presence: true

  belongs_to :user, foreign_key: 'created_by_id'
  belongs_to :location_group, optional: true
  has_and_belongs_to_many :location_labels, 
    # Note: Rails only triggers when associating through << statement
    # See: https://guides.rubyonrails.org/association_basics.html#association-callbacks
    :after_add => :after_label_added, 
    :after_remove => :after_label_removed
  has_and_belongs_to_many :geospaces
  has_many :measurements, dependent: :nullify
  has_many :clients, dependent: :nullify
  has_one :client_count_aggregate, :as => :aggregator

  after_validation :custom_geocode, if: :lat_long_changed?

  scope :where_online, -> { left_joins(:clients).group(:id).having("sum(case when clients.pinged_at > (now() - interval '1 minute') then 1 else 0 end) >= 1") }

  scope :where_offline, -> { left_joins(:clients).group(:id).having("sum(case when clients.pinged_at > (now() - interval '1 minute') then 1 else 0 end) = 0") }

  scope :where_has_client_associated, -> { joins(:clients).where("clients.location_id IS NOT NULL").distinct }

  scope :with_geospaces,  -> { joins("JOIN geospaces ON ST_INTERSECTS(ST_SetSRID(locations.lonlat, 4326)::geometry, ST_SetSRID(geospaces.geom, 4326)::geometry)") }

  def event_data()
    data = self.as_json.transform_keys(&:to_sym)
    data["labels"] = self.location_labels.map {|label| label.name}
    return data
  end

  def apply_on_create(state, event)
    state.update({
      name: self.name,
      address: self.address,
      labels: self.location_labels.map {|label| label.name},
    })
  end

  def after_label_added(label)
    event_data = {
      id: label.id,
    }
    event = Location.new_event(self, Location::Events::LABEL_ADDED, event_data)
    create_snapshot_from_event event do |state, event|
      state["labels"] << label.name
    end
  end

  def after_label_removed(label)
    event_data = {
      id: label.id,
    }
    event = Location.new_event(self, Location::Events::LABEL_REMOVED, event_data)
    create_snapshot_from_event event do |state, event|
      state["labels"].delete(label.name)
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

  def online?
    clients.where(online: true).any?
  end

  def diff_to_human(diff, expected_value)
    sign = diff > 0 ? "+" : "" # Don't need the - for negative values as it will come in the actual calculation
    rounded_percentage = ((diff / expected_value) * 100).round(2)
    "#{sign}#{rounded_percentage}%"
  end

  def download_diff
    avg = self.download_avg
    if avg.nil? || self.expected_mbps_down.nil?
      return nil
    end
    diff = avg - self.expected_mbps_down
    diff_to_human(diff, self.expected_mbps_down)
  end

  def upload_diff
    avg = self.upload_avg
    if avg.nil? || self.expected_mbps_up.nil?
      return nil
    end
    diff = avg - self.expected_mbps_up
    diff_to_human(diff, self.expected_mbps_up)
  end

  def recalculate_averages!
    self.download_avg = self.measurements.average(:download).round(3) if self.measurements.count.positive?
    self.upload_avg = self.measurements.average(:upload).round(3) if self.measurements.count.positive?
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

  def geospaces
    Geospace.with_locations.where("locations.id = ?", self.id)
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


end
