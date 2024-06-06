class LocationCategoriesController < ApplicationController
  include CategoriesHelper
  before_action :authenticate_user!

  def search
    notice = params[:account_id].nil? ? "Please select an account before searching for categories." : nil
    if notice.nil?
      @account_id = params[:account_id] || current_account.id
      @query = params[:query]
      @categories = Category.where(account_id: @account_id)
      @add_category = @categories.where(name: @query).empty? if @query.present?
      @categories = @categories.where("name LIKE ?", "%#{@query}%")
    end
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to "/locations", notice: notice }
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
    @account_id = params[:account_id]
    @categories = Category.where(account_id: @account_id)

    @notice = "There is no account with given ID." if @categories.empty?

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
    @type = params[:type] || "create"
    @network_id = params[:network_id]
    @accounts = policy_scope(Account)
    respond_to do |format|
      format.turbo_stream
    end
  end

  def import
    categories_ids = params[:account_categories]
    import_to_account = params[:import_to] || current_account.id
    error = import_categories_into_account(categories_ids, import_to_account)

    respond_to do |format|
      if error.nil?
        network_id = params[:network_id]
        @location = network_id.present? ? Location.find(network_id) : Location.new
        @notice = "All categories were successfully imported."
      else
        @notice = error
      end
      format.turbo_stream
    end
  end
end
