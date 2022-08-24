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
        results = Geocoder.search(params[:address])
        if results.first
          render json: results.map {|match| {
            address: "#{match.house_number} #{match.street}, #{match.city}, #{match.state} #{match.postal_code}", 
            coordinates: match.coordinates
          }}
        else
          render json: []
        end
      end

      def coordinates
        results = Geocoder.search(params[:coordinates])
        if results.first
          coordinates_array = params[:coordinates].split(",")
          match = results.first
          render json: {
            address: "#{match.house_number} #{match.street}, #{match.city}, #{match.state} #{match.postal_code}", 
            coordinates: coordinates_array
          }
        else
          render json: {}, status: :not_found
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