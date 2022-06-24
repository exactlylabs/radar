class GeocodeController < ApplicationController
  skip_forgery_protection only: %i[ code reverse_code ]

  def code
    if params["address"].nil?
      results = Geocoder.search(request.ip)
    else
      results = Geocoder.search(params["address"])
    end
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