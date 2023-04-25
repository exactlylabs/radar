class CategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_category, except: [:index]

  def index
  end

  def delete
  end

  def edit
  end

  def cancel_edit
    respond_to do |format|
      format.html { render partial: "categories/list_item", locals: {category: @category} }
    end
  end

  def update
    respond_to do |format|
      if @category.update(name: params[:category][:name])
        @notice = "Category updated successfully."
        format.turbo_stream
        format.html { render partial: "categories/list_item", locals: {category: @category} }
      else
        format.html { redirect_to "/locations", notice: "Error updating your category. Please try again." }
      end
    end
  end

  def destroy
    locations_by_category = policy_scope(CategoriesLocation).where(category_id: @category.id).pluck(:location_id)
    @locations = policy_scope(Location).where(id: locations_by_category)
    respond_to do |format|
      if @category.delete
        @notice = "Category deleted successfully."
        format.turbo_stream
      else
        format.html { redirect_to "/locations", notice: "Error deleting your category. Please try again." }
      end
    end
  end

  private
  def set_category
    @category = policy_scope(Category).find(params[:id])
    if !@category
      raise ActiveRecord::NotFound("Couldn't find Category with 'id'=#{params[:id]}", Category.name, params[:id])
    end
  end
end