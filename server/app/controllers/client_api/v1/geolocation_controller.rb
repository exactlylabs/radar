module ClientApi
  module V1
    class GeolocationController < ApiController
      def code
        results = Geocoder.search(params[:address])
        render json: results.first.coordinates
      end
    end
  end
end