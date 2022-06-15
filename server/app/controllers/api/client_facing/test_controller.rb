module ClientFacing
  class ClientFacingController < ApiController

    def code
      results = Geocoder.search(params["address"])
      #response.headers['Access-Control-Allow-Origin'] = 'http://localhost:9999'
      #response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
      #response.headers['Access-Control-Request-Method'] = '*'
      #response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      render json: results.first.coordinates
    end

    def raw
      puts params
    end
  end
end