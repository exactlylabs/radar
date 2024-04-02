class LocationCategoriesController < ApplicationController
  before_action :authenticate_user!

  def search
    notice = nil
    notice = "Please select an account before searching for categories." if params[:account_id].nil?
    if notice.nil?
      @account_id = params[:account_id] || current_account.id
      @query = params[:query]
      @categories = Category.where(account_id: @account_id)
      @add_category = @categories.where(name: @query).empty? if @query.present?
      @categories = @categories.where("name LIKE ?", "%#{@query}%")
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
    @notice = nil
    begin
      @account_id = params[:account_id]
      @categories = Category.where(account_id: @account_id)
    rescue ActiveRecord::RecordNotFound => e
      @notice = "There is no account with given ID."
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def close_dropdown
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to "/locations" }
    end
  end

  def import_from_another_account
    @network_id = params[:network_id]
    @accounts = policy_scope(Account)
    respond_to do |format|
      format.turbo_stream
    end
  end

  def import
    categories_ids = params[:account_categories]
    import_to_account = params[:import_to] || current_account.id
    error = nil
    begin
      Category.transaction do
        # Parse string to array of integers
        categories_ids = categories_ids.split(',').map(&:to_i)
        categories_ids.each do |category_id|
          next if category_id.nil? || category_id == -1

          category = Category.find(category_id)
          new_category = category.dup
          new_category.account_id = import_to_account
          new_category.save!
        end
      end
    rescue Exception => e
      @notice = "Oops! Something went wrong. Please try again later."
    end
    respond_to do |format|
      if error.nil?
        network_id = params[:network_id]
        @location = network_id.present? ? Location.find(network_id) : Location.new
        @notice = "All categories were successfully imported."
      end
      format.turbo_stream
    end
  end
end