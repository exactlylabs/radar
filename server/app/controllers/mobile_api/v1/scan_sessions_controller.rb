module MobileApi::V1
  class ScanSessionsController < ApiController
    before_action :set_scan_session, except: [:index, :create]

    def index
      return render_paginated_response(scan_sessions) { |item| serialize_scan_session(item) }
    end

    def create
      item = MobileScanSession.create(mobile_user_device: @current_user_device)
      if item.errors.present?
        return render_error_for(item)
      end
      render json: serialize_scan_session(item, details: true), status: 201
    end

    def show
      render json: serialize_scan_session(@scan_session, details: true), stauts: 200
    end

    def new_post
      pkg = ScanPackagePb::ScanPackage.decode(request.body.read)
      network_measurements = split_measurements_by_network(pkg)

      (pkg.access_points.to_a + pkg.cells.to_a).each do |obj|
        network_type = obj.is_a?(ScanPackagePb::AccessPoint) ? :wifi : :cell
        network_post_data = network_measurements["#{network_type}:#{obj.id}"]
        next if network_post_data.nil?

        network = MobileScanNetwork.find_by(network_type: network_type, network_id: obj.id)
        is_new = false
        if network.nil?
          network = MobileScanNetwork.new(
            network_type: network_type,
            network_id: obj.id,
            last_seen_at: network_post_data[:last_seen],
            first_seen_at: network_post_data[:first_seen],
            found_by_session: @scan_session,
            lonlat: "POINT(#{network_post_data[:longitude]} #{network_post_data[:latitude]})"
          )
          is_new = true
        end

        case network_type
        when :wifi
          network.name = obj.ssid
          network.wifi_security = MobileScanNetwork.security_from_capabilities(obj.capabilities)
          network.wifi_frequency = obj.frequency
          network.wifi_center_freq0 = obj.center_freq0
          network.wifi_center_freq1 = obj.center_freq1
        when :cell
          network.name = obj.operator
          network.cell_network_type = obj.phone_type
          network.cell_network_data_type = obj.data_network_type
          network.extra_information = obj.cell_identity
        end
        network.save!

        data = {mobile_scan_session_id: @scan_session.id, mobile_scan_network_id: network.id, last_seen_at: network_post_data[:last_seen]}
        data[:is_new] = true if is_new # Only set if true
        @scan_session.mobile_scan_session_networks.upsert(data, unique_by: [:mobile_scan_session_id, :mobile_scan_network_id])

        # Store measurements
        network_post_data[:measurements].each do |measurement|
          @scan_session.mobile_scan_network_measurements.create!(
            mobile_scan_network: network,
            signal_strength: measurement.dbm,
            noise: measurement.snr,
            timestamp_before: measurement.timestamp_before,
            timestamp_after: measurement.timestamp_after,
            lonlat_before: "POINT(#{measurement.longitude_before} #{measurement.latitude_before})",
            accuracy_before: measurement.accuracy_before,
            lonlat_after: "POINT(#{measurement.longitude_after} #{measurement.latitude_after})",
            accuracy_after: measurement.accuracy_after,
          )
        end
      end

      head(204)
    end

    def history
      networks = @scan_session.mobile_scan_session_networks
      if params[:network_type] == 'cell'
        networks = networks.cell
      elsif params[:network_type] == 'wifi'
        networks = networks.wifi
      end

      return render_paginated_response(networks) do |item|
        is_new = item.is_new
        last_seen_at = item.last_seen_at
        item.mobile_scan_network.as_json(only: [:id, :network_id, :network_type, :name]).merge({is_new: is_new, last_seen_at: last_seen_at})
      end
    end

    private

    def serialize_scan_session(item, details: false)
      item.as_json(only: [:id, :created_at, :updated_at]).merge(
        details ? {
          wifi_count: item.wifi_networks.count,
          cell_count: item.cell_networks.count,
          speed_test_count: item.speed_tests.count,
        } : {}
      )
    end

    def set_scan_session
      id = params[:mobile_scan_session_id] || params[:id]
      begin
        @scan_session = scan_sessions.find(id)
      rescue ActiveRecord::RecordNotFound
        return render_not_found
      end
    end

    def scan_sessions
      MobileScanSession.where(mobile_user_device: @current_user_device).order(created_at: :desc)
    end

    def split_measurements_by_network(pkg)
      network_measurements = (pkg.access_points.to_a + pkg.cells.to_a).each_with_object({}) do |obj, hash|
        network_type = obj.is_a?(ScanPackagePb::AccessPoint) ? :wifi : :cell
        key = "#{network_type}:#{obj.id}"
        hash[key] = {
          obj: obj,
          measurements: [],
          first_seen: nil,
          last_seen: nil,
          latitude: nil,
          longitude: nil,
        }
      end

      # Split measurements by network, collect first and last seen timestamps and filter out any duplicate measurement
      #  for the current session.
      pkg.measurements.each do |measurement|
        network_type = measurement.signal_id.signal_type.downcase

        key = "#{network_type}:#{measurement.signal_id.id}"
        network = network_measurements[key]

        next if network.nil?

        network[:first_seen] = measurement.timestamp_before.to_time if network[:first_seen].nil? || network[:first_seen] > measurement.timestamp_before.to_time
        network[:last_seen] = measurement.timestamp_before.to_time if network[:last_seen].nil? || network[:last_seen] < measurement.timestamp_before.to_time
        network[:latitude] = measurement.latitude_before if network[:latitude].nil?
        network[:longitude] = measurement.longitude_before if network[:longitude].nil?

        if network_type == :wifi
          cache_key = "#{@scan_session.id}:wifi:#{network[:obj].id};#{measurement.latitude_before.round(5)},#{measurement.longitude_before.round(5)}"
        else
          cache_key = "#{@scan_session.id}:cell:#{network[:obj].id};#{measurement.latitude_before.round(5)},#{measurement.longitude_before.round(5)}"
        end

        stored_signals = Rails.cache.fetch(cache_key, expires_in: 1.hour) do
          @scan_session.mobile_scan_network_measurements
            .where_network_external_id(measurement.signal_id.signal_type, measurement.signal_id.id)
            .around_location(measurement.longitude_before, measurement.latitude_before, 1e-5) # 5 decimal places precision
            .pluck(:signal_strength)
        end

        if !stored_signals.include?(measurement.dbm)
          stored_signals << measurement.dbm
          network_measurements[key][:measurements] << measurement
          # Update the cache for any upcoming measurement at the same point to be skipped
          Rails.cache.write(cache_key, stored_signals, expires_in: 1.hour)
        end
      end

      return network_measurements
    end
  end
end
