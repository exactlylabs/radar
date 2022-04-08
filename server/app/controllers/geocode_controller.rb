class GeocodeController < ApplicationController
  skip_forgery_protection only: %i[ code ]

  def code
    results = Geocoder.search(params["address"])
    render json: results.first.coordinates
  end
end