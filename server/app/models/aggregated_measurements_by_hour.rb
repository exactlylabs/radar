class AggregatedMeasurementsByHour <  ApplicationRecord
  # This is backed by a materialized view

  belongs_to :location
  belongs_to :acccount
  belongs_to :autonomous_system_org, optional: true

  def readonly?
    true
  end
end
