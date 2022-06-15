class GeocodeController < ApplicationController
  skip_forgery_protection only: %i[ code reverse_code ]

  def code
    results = Geocoder.search(params["address"])
    if !results.first.present?
      return render json: []
    end
    render json: results.first.coordinates
  end

  def reverse_code
    results = Geocoder.search(params[:query])
    render json: results.first.address.split(',')
  end
end