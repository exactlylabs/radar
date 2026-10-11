class AggregatedMeasurementsByHour <  ApplicationRecord
  # Maintained by RefreshAggregatedMeasurementsJob

  belongs_to :location
  belongs_to :acccount
  belongs_to :autonomous_system_org, optional: true

  def readonly?
    true
  end
end
