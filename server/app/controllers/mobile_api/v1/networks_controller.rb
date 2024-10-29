module MobileApi::V1
  class NetworksController < ApiController
    before_action :set_network, only: [:show]

    def index
      render_paginated_response(networks) { |item| serialize_mobile_scan_network(item) }
    end

    def show
      render json: serialize_mobile_scan_network(networks.find(params[:id]), details: true), status: 200
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

  end
end
