class Suggestion
  attr_accessor :full_address, :city, :postcode, :street, :house_number, :state, :country, :coordinates, :top_level_address, :lower_level_address

  def initialize(full_object)
    @full_address = full_object.address
    @city = full_object.city || nil
    @postcode = full_object.postal_code || nil
    @street = full_object.street || nil
    @house_number = full_object.house_number || nil
    @state = full_object.state || nil
    @country = full_object.country || nil
    @top_level_address = "#{house_number}"
    @top_level_address += " " if @top_level_address != ""
    @top_level_address += "#{@street}"
    @lower_level_address = "#{@city}"
    @lower_level_address += ", " if @lower_level_address != ""
    @lower_level_address += "#{@state}"
    if @lower_level_address != ""
      @lower_level_address += " #{@postcode}" if @postcode != ""
    else
      @lower_level_address = "#{@postcode}" if @postcode != ""
    end
    @lower_level_address += ", " if @lower_level_address != ""
    @lower_level_address += "#{@country}"

    if @top_level_address == ""
      @top_level_address = @lower_level_address
      @lower_level_address = nil
    end

    @coordinates = full_object.coordinates
  end
end

class GeocodeController < ApplicationController
  def code
    if params["address"].nil?
      results = Geocoder.search(request.remote_ip)
    else
      results = Geocoder.search(params["address"])
    end
    if results.first.present? && results.first.coordinates.length > 0
      return render json: results.first.coordinates
    end
    render json: Rails.env.development? ? [40.566296, -97.264547] : []
  end

  def suggestions
    @query = params[:address]
    @suggestions = Geocoder.search(@query).map {|suggestion| Suggestion.new(suggestion) }.first(5)
    respond_to do |format|
      format.turbo_stream
    end
  end

  def reverse_code
    results = Geocoder.search(params[:query])
    if results.first.nil?
      render json: {address: "Unknown Location"}
      return
    end
    render json: {address: results.first.address}
  end
end