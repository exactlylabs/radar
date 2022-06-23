class GeocodeController < ApplicationController
  skip_forgery_protection only: %i[ code reverse_code ]

  def code
    if params["address"].nil?
      ip = request.ip == "::1" ? "181.167.194.106" : request.ip
      results = `geocode #{ip}`
      results = results.split
      return render json: [results[1].to_f, results[3].to_f]
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