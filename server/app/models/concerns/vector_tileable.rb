###
#
# VectorTileable concern adds the capability of generating cacheable vector tiles out of the query.
# If cache is enabled, it tries to find the vector tile for the set of filters from it.
# In case of a cache miss, after performing the query, it stores it in cache for the amount set in "vt_cache_exp" variable (defaults to `1.hour.in_secods`` )
#
# Any update to the object's lonlat value results in a cleanup of all tiles that contain both the previous lonlat,
# and the new one (in all zoom levels)
#
###
module VectorTileable
  extend ActiveSupport::Concern

  MIN_ZOOM = 0  # Default min zoom for most maps
  MAX_ZOOM = 24 # Default max zoom for most maps

  included do |klass|
    cattr_accessor(:lonlat_column) { "lonlat" }
    cattr_accessor(:vt_cache_exp) { 1.hour.in_seconds }
    extend(ClassMethods)
    after_commit do
      if send("saved_change_to_#{lonlat_column}?")
        lonlat = send(lonlat_column)
        lonlat_before = send("#{lonlat_column}_before_last_save")

        self.class.invalidate_vt_cache(lonlat.latitude, lonlat.longitude) if lonlat.present?
        self.class.invalidate_vt_cache(lonlat_before.latitude, lonlat_before.longitude) if lonlat_before.present?
      end
    end
  end

  module ClassMethods
    # Transform a query into a vector tile
    def to_vector_tile(z, x, y)
      mvt = sanitize_sql_array([
        "ST_AsMVTGeom(ST_Transform(#{lonlat_column}::geometry, 3857),
        ST_TileEnvelope(:z, :x, :y), -- bounds
        4096 -- extent
        ) as geom", {x: x, y: y, z: z}])

      query = self.where(
        "#{lonlat_column}::geometry && ST_Transform(ST_TileEnvelope(:z, :x, :y), 4326)",
        {x: x, y: y, z: z}
      ).select(mvt)

      sql = %{
        WITH tile_data AS (
          #{query.to_sql}
        )

        SELECT ST_AsMVT(tile_data.*, '#{self.table_name}', 4096, 'geom') as mvt
        FROM tile_data
      }
      get_vector_tile(z, x, y, sql)
    end

    def invalidate_all_vt_cache!
      Rails.cache.delete_matched("#{base_cache_key}/*")
    end

    # Invalidate cache for all keys that have the XYZ
    # combination that holds the lonlat point within its bounds
    # to force a refresh considering there is a new test
    def invalidate_vt_cache(latitude, longitude)
      # I'm clearing some adjacent tiles just to make sure the area is covered
      # as sometimes the calculation gives a result which is right at the edge
      # of the tile, so it could be a miss. The zoom >= 6 is because at smaller
      # zoom levels, the tiles are so big that the chance of a miss is pretty low
      with_tiles_coordinates(
        latitude,
        longitude,
        include_adjacent: true,
        adjacent_start_zoom: 6
      ) do |z, x, y, adjacent|
          Rails.cache.delete_matched(base_cache_key + "/#{z}/#{x}/#{y}/*")
      end
    end

    protected

    def get_vector_tile(z, x, y, sanitized_sql)
      key = vt_cache_key(z, x, y, sanitized_sql)

      data = Rails.cache.fetch(key, exp: vt_cache_exp) do
        query_response = ActiveRecord::Base.connection.execute(sanitized_sql)
        query_response[0]['mvt']
      end
      ActiveRecord::Base.connection.unescape_bytea(data)
    end

    # Given lat, lng and zoom level, get XY tile combination
    def get_xy_from_coordinates_and_zoom(lat, lng, zoom)
      n = 2.0 ** zoom
      x_tile = ((lng + 180.0) / 360.0 * n).floor
      y_tile = ((1.0 - Math.log(Math.tan(lat * Math::PI / 180.0) + 1.0 / Math.cos(lat * Math::PI / 180.0)) / Math::PI) / 2.0 * n).floor
      [x_tile, y_tile]
    end

    def with_tiles_coordinates(latitude, longitude, include_adjacent: true, adjacent_start_zoom: 6, &block)
      (MIN_ZOOM..MAX_ZOOM).each do |zoom|
        x_y = get_xy_from_coordinates_and_zoom(latitude, longitude, zoom)

        block.call(zoom, x_y[0], x_y[1], adjacent: false)

        if include_adjacent && zoom >= adjacent_start_zoom
          x_range = (x_y[0] - 1..x_y[0] + 1).to_a
          y_range = (x_y[1] - 1..x_y[1] + 1).to_a

          x_range.product(y_range).each do |x, y|
            block.call(zoom, x, y, adjacent: true)
          end
        end
      end
    end

    def vt_cache_key(z, x, y, sql)
      base_cache_key + "/#{z}/#{x}/#{y}/#{Digest::SHA256.hexdigest(sql)}"
    end

    def base_cache_key
      "mvt/#{self.class.name}"
    end
  end
end
