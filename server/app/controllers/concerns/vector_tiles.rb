module VectorTiles
  extend ActiveSupport::Concern

  MIN_ZOOM = 0  # Default min zoom for most maps
  MAX_ZOOM = 24 # Default max zoom for most maps

  class Namespaces
    SPEED_TESTS = "speed_tests"
    NETWORKS = "networks"
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

  def get_vector_tile(namespace, sanitized_sql)
    key = vt_cache_key(namespace, params[:z], params[:x], params[:y], sanitized_sql)

    data = Rails.cache.fetch(key, exp: 1.hour.in_seconds) do
      query_response = ActiveRecord::Base.connection.execute(sanitized_sql)
      query_response[0]['mvt']
    end
    ActiveRecord::Base.connection.unescape_bytea(data)
  end

  # Invalidate cache for all keys that have the XYZ
  # combination that holds the lonlat point within its bounds
  # to force a refresh considering there is a new test
  def invalidate_cache(namespace, latitude, longitude)
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
        Rails.cache.delete_matched(VectorTiles.base_cache_key(namespace) + "/#{z}/#{x}/#{y}/*")
    end
  end

  def vt_cache_key(namespace, z, x, y, sql)
    VectorTiles.base_cache_key(namespace) + "/#{z}/#{x}/#{y}/#{Digest::SHA256.hexdigest(sql)}"
  end

  def self.invalidate_all_cache!(namespace)
    Rails.cache.delete_matched("#{base_cache_key(namespace)}/*")
  end

  def self.base_cache_key(namespace)
    "mvt/#{namespace}"
  end
end
