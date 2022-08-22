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

      # POST /client_api/v1/suggestions
      def suggestions
        results = Geocoder.search(params[:address])
        if results.first
          render json: results.map {|match| {address: match.display_name, coordinates: match.coordinates}}
        else
          render json: []
        end
      end

      def coordinates
        results = Geocoder.search(params[:coordinates])
        if results.first
          coordinates_array = params[:coordinates].split(",")
          render json: {address: results.first.display_name, coordinates: coordinates_array}
        else
          render json: {}, status: :not_found
        end
      end
    end
  end
end