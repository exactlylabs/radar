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
          render json: results.map {|match| match.display_name}
        else
          render json: []
        end
      end
    end
  end
end