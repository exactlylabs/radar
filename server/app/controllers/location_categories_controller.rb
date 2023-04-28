class LocationCategoriesController < ApplicationController
  before_action :authenticate_user!

  def search
    @location = policy_scope(Location).find(params[:location_id]) if params[:location_id]
    @query = params[:query]
    if !@query.blank?
      @categories = policy_scope(Category).where("LOWER(name) LIKE ?", "%#{@query.downcase}%")
    else
      @categories = policy_scope(Category)
    end
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to "/locations" }
    end
  end

  def change_selected_categories
    ids = params[:categories].split(',')
    @categories = policy_scope(Category).where(id: ids)
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to "/locations" }
    end
  end

  def open_dropdown
    @categories = policy_scope(Category)
    @location = policy_scope(Location).where(id: params[:location_id]).first if params[:location_id].present?
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to "/locations" }
    end
  end

  def close_dropdown
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to "/locations" }
    end
  end
end