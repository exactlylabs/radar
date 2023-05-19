module ClientApi
  module V1
    class GeolocationController < ApiController
      def code
        results = Geocoder.search(params[:address])
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
        Google::Cloud::Trace.in_span "Searching in Geocoder: #{params[:address]}" do
          results = Geocoder.search(params[:address])
        end

        if results.present?
          render json: results.filter {|match| match.city && match.street && match.state && match.postal_code && match.house_number}
                              .map {|match| Suggestion.new(match.city, match.street, match.state, match.postal_code, match.house_number, match.coordinates) }
                              .first(3)
                              .to_set
                              .to_json
        else
          render json: []
        end
        
      end

      def coordinates
        results = Geocoder.search(params[:coordinates])
        if results.first
          coordinates_array = params[:coordinates].split(",")
          match = results.first
          render json: Suggestion.new(
            match.city,
            match.street,
            match.state,
            match.postal_code,
            match.house_number,
            coordinates_array
          )
        else
          render json: {coordinates: []}, status: :ok
        end
      end

      def user_coordinates
        # By using remote_ip we would get the actual client ip even
        # after going through proxies/nginx.
        # https://stackoverflow.com/questions/10997005/whats-the-difference-between-request-remote-ip-and-request-ip-in-rails#:~:text=request.remote_ip%20is%20smarter%20and%20gets%20the%20actual%20client%20ip.%20This%20can%20only%20be%20done%20if%20the%20all%20the%20proxies%20along%20the%20way%20set%20the%20X%2DForwarded%2DFor%20header.
        results = Geocoder.search(request.remote_ip)
        if results.first
          return render json: results.first.coordinates
        end
        render json: []
      end
    end
  end
end