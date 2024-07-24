module ClientApi
  module V1
    class GeolocationController < ApiController
      def code
        results = GeoTools::CustomGeocoder.search(params[:address])
        if results.first
          render json: results.first.coordinates
        else
          render json: []
        end
      end

      #
      # POST /client_api/v1/suggestions
      def suggestions
        results = []
        results = GeoTools::CustomGeocoder.search(params[:address])

        if results.present?
          render json: results.map {|match| Suggestion.new(match.city, match.street, match.state, match.postal_code, match.house_number, match.coordinates) }
                              .first(3)
                              .to_set
                              .to_json
        else
          render json: []
        end
      end

      def coordinates
        normalized_param = params[:coordinates].is_a?(Array) ? params[:coordinates] : params[:coordinates].split(",")
        results = GeoTools::CustomGeocoder.search(normalized_param)
        if results.first
          match = results.first
          render json: Suggestion.new(
            match.city,
            match.street,
            match.state,
            match.postal_code,
            match.house_number,
            normalized_param
          )
        else
          render json: {coordinates: []}, status: :ok
        end
      end

      def user_coordinates
        # By using remote_ip we would get the actual client ip even
        # after going through proxies/nginx.
        # https://stackoverflow.com/questions/10997005/whats-the-difference-between-request-remote-ip-and-request-ip-in-rails#:~:text=request.remote_ip%20is%20smarter%20and%20gets%20the%20actual%20client%20ip.%20This%20can%20only%20be%20done%20if%20the%20all%20the%20proxies%20along%20the%20way%20set%20the%20X%2DForwarded%2DFor%20header.

        # Coordinates for middle of USA for development
        return render json: [39.50, -98.35] if ENV['RAILS_ENV'] == 'development'
        coordinates = GeoTools::CustomGeocoder.search_ip(request.remote_ip)
        if coordinates
          return render json: coordinates
        end
        render json: []
      end
    end
  end
end
