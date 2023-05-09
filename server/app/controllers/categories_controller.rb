class CategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_category, except: [:index, :new, :cancel_new, :create]

  def index
    if params[:query]
      @categories = policy_scope(Category).where("name ILIKE ?", "%#{params[:query]}%")
    else
      @categories = policy_scope(Category)
    end
  end

  def new
    respond_to do |format|
      format.turbo_stream
    end
  end

  def create
    error = nil
    begin
      Category.transaction do
        @category = Category.new category_params
        @category.color_hex = "#4b7be5" if @category.color_hex.empty?
        @category.account = current_account
        @category.save!
      end
    rescue Exception => e
      error = e
    end
    respond_to do |format|
      if error.nil?
        @categories = policy_scope(Category)
        format.turbo_stream
      else
        format.html { render "/locations", notice: "Error creating new Category. Please try again later." }
      end
    end
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

  def cancel_new
    @categories = policy_scope(Category)
    respond_to do |format|
      format.turbo_stream
    end
  end

  def update
    respond_to do |format|
      if @category.update(name: params[:category][:name], color_hex: params[:category][:color_hex])
        @notice = "Category updated successfully."
        @locations = policy_scope(Location).joins(:categories_locations).where(categories_locations: {category_id: @category.id})
        format.turbo_stream
        format.html { render partial: "categories/list_item", locals: {category: @category} }
      else
        format.html { redirect_to "/locations", notice: "Error updating your category. Please try again." }
      end
    end
  end

  def destroy
    policy_scope(CategoriesLocation).where(category_id: @category.id).destroy_all
    respond_to do |format|
      if @category.destroy
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
  end

  def category_params
    params.require(:category).permit(:name, :color_hex)
  end
end