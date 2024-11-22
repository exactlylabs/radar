module MobileApi::V1
  class NetworksController < ApiController
    before_action :set_network, only: [:show]
    before_action :validate_explore_params, only: [:carriers, :tiles]

    def index
      render_paginated_response(networks) { |item| serialize_mobile_scan_network(item) }
    end

    def show
      render json: serialize_mobile_scan_network(networks.find(params[:id]), details: true), status: 200
    end

    def carriers
      bbox = params[:bbox]
      sql_params = {}

      if bbox.present? && bbox.length != 4
        return render json: {
          error: "bbox argument must be an array of size 4 [x_0, y_0, x_1, y_1]",
          error_code: "invalid"
        }, status: :unprocessable_entity
      end

      networks = self.explore_networks.cell
      if bbox.present?
        networks = networks.within_box(*bbox)
      end

      carriers = networks.pluck(:name).map { |n| {name: n} }

      render json: {items: carriers}, status: 200
    end

    def tiles
      x = params[:x].to_i
      y = params[:y].to_i
      z = params[:z].to_i


      @tiles = self.explore_networks.select(
        :id, :network_type, :network_id, :name, :cell_network_type, :cell_network_data_type, :wifi_security
      ).to_vector_tile(z, x, y)

      response.headers['Content-Type'] = 'application/vnd.mapbox-vector-tile'
      response.headers['Content-Length'] = @tiles&.length&.to_s || '0'
      send_data @tiles, type: 'application/vnd.mapbox-vector-tile', disposition: 'inline'
    end

    private

    def serialize_mobile_scan_network(item, details: false)
      data = item.as_json(only: [:id, :network_type, :network_id, :name, :created_at, :updated_at])

      if details
        data = data.merge(item.as_json(only: [
          :cell_network_type, :cell_network_data_type, :cell_channel,
          :wifi_security, :wifi_mac, :wifi_channel_width, :wifi_frequency, :wifi_center_freq0, :wifi_center_freq1,
          :last_seen_at, :first_seen_at, :accuracy, :address_line1, :address_line2
        ]))
        data[:seen_count] = item.mobile_scan_session_networks.count
        data[:latitude] = item.lonlat&.latitude
        data[:longitude] = item.lonlat&.longitude
      end

      data
    end

    def networks
      networks = MobileScanNetwork.all
      if params[:network_type].present?
        networks = networks.where(network_type: params[:network_type])
      end
      if params[:network_id].present?
        networks = networks.where(network_id: params[:network_id])
      end

      networks
    end

    def set_network
      begin
        @network = networks.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        return render_not_found
      end
    end

    def explore_networks
      network_types = []
      network_types << :wifi if explore_filters[:wifi].to_s == "true"
      network_types << :cell if explore_filters[:cell].to_s == "true"
      networks = MobileScanNetwork.where(network_type: network_types)
      unless explore_filters[:global].to_s == "true"
        networks = networks.from_user(current_user)
      end
      if explore_filters[:wifi_security_types].present?
        networks = networks.where(wifi_security: explore_filters[:wifi_security_types])
      end
      if explore_filters[:cell_carrier_name].present?
        networks = networks.where(name: explore_filters[:cell_carrier_name])
      end
      if explore_filters[:cell_network_types].present?
        networks = networks.where(cell_network_type: explore_filters[:cell_network_types])
      end
      if explore_filters[:cell_network_data_types].present?
        networks = networks.where(cell_network_data_type: explore_filters[:cell_network_data_types])
      end

      return networks
    end

    def explore_filters(*extra_filters)
      params.with_defaults(
        global: true,
        wifi: true,
        cell: true
      )
    end

    def validate_explore_params
      errors = {}

      if errors.present?
        render json: {errors: errors, error_code: 'invalid'}, status: 422
        return
      end
    end

  end
end
