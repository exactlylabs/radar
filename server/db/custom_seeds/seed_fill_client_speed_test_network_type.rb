# frozen_string_literal: true

ClientSpeedTest.transaction do
  ClientSpeedTest.where(network_type: nil).where.not(connection_data: nil).each do |cst|
    network_type = cst.connection_data['connectionType']
    next unless network_type.present?

    cst.network_type = network_type.humanize
    cst.backfilled = true
    cst.save!
  end
end
