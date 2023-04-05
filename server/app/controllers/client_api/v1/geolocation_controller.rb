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
        results = Geocoder.search(request.ip)
        if results.first
          return render json: results.first.coordinates
        end
        render json: []
      end
    end
  end
end