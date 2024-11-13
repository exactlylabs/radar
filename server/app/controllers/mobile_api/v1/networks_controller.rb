module MobileApi::V1
  class NetworksController < ApiController
    include VectorTiles

    before_action :set_network, only: [:show]

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

      elsif bbox.present?
        sql_params.merge!({
          bbox_x_0: params[:bbox][0],
          bbox_y_0: params[:bbox][1],
          bbox_x_1: params[:bbox][2],
          bbox_y_1: params[:bbox][3]
        })
      end

      sql = %{
        SELECT
          name
        FROM mobile_scan_networks
        WHERE
            network_type = 'cell'
            #{'AND lonlat::geometry && ST_MakeEnvelope(:bbox_x_0, :bbox_y_0, :bbox_x_1, :bbox_y_1, 4326)' if bbox.present?}
        GROUP BY name
        ORDER BY name
      }

      carriers = ActiveRecord::Base.connection.execute(
        ActiveRecord::Base.sanitize_sql([sql, sql_params])
      )

      render json: {items: carriers}, status: 200
    end

    def tiles
      x = params[:x].to_i
      y = params[:y].to_i
      z = params[:z].to_i
      sql = %{
        WITH tile_data AS (
          SELECT
            mobile_scan_networks.id,
            network_type,
            network_id,
            name,
            cell_network_type,
            cell_network_data_type,
            wifi_security,
            ST_AsMVTGeom(
              ST_Transform(lonlat::geometry, 3857),
              ST_TileEnvelope(:z, :x, :y), -- bounds
              4096 -- extent
            ) as "geom"
          FROM mobile_scan_networks
          WHERE
            CAST(mobile_scan_networks.lonlat as geometry) && ST_Transform(ST_TileEnvelope(:z, :x, :y), 4326)
        )

        SELECT ST_AsMVT(tile_data.*, 'networks', 4096, 'geom') as mvt
        FROM tile_data
      }
      sql = ActiveRecord::Base.sanitize_sql([sql, {z: params[:z], x: params[:x], y: params[:y]}])

      @tiles = get_vector_tile(Namespaces::NETWORKS, sql)
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

  end
end
