module ClientApi
  module V1
    class GeolocationController < ApiController
      before_action :rate_limit
      after_action :set_cors_access_control_headers
      skip_forgery_protection only: %i[ code raw ]

      def code
        results = Geocoder.search(params[:address])
        render json: results.first.coordinates
      end

    end
  end
end