class LocationCategoriesController < ApplicationController
  before_action :authenticate_user!

  def search
    @location = policy_scope(Location).find(params[:location_id]) if params[:location_id]
    @query = params[:query]
    if @query.present?
      @categories = policy_scope(Category).where("name ILIKE ?", "%#{@query}%")
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
    notice = nil
    begin
      @location = policy_scope(Location).find(params[:location_id]) if params[:location_id].present?
    rescue ActiveRecord::RecordNotFound => e
      notice = "There is no location with given ID."
    end
    respond_to do |format|
      if notice.nil?
        format.turbo_stream
        format.html { redirect_to "/locations" }
      else
        format.html { redirect_to "/locations", notice: notice }
      end
    end
  end

  def close_dropdown
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to "/locations" }
    end
  end
end