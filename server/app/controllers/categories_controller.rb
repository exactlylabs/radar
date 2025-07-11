class CategoriesController < ApplicationController
  include CategoriesHelper
  before_action :authenticate_user!
  before_action :set_category, except: [:index, :new, :cancel_new, :create, :import_from_another_account, :import]

  def index
    @categories = policy_scope(Category)

    @query = params[:query]
    if @query
      @categories = @categories.where("name ILIKE ?", "%#{@query}%")
    end

    # add to the map the accounts that don't have any categories.
    @categories = if current_account.is_all_accounts?
                    categories_by_account
                  else
                    @categories.where(account_id: current_account.id)
                  end

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def new
    @account_id = params[:account_id] || current_account.id
    respond_to do |format|
      format.turbo_stream
    end
  end

  def create
    error = nil
    @account_id = params[:category][:account_id] || current_account.id
    category_account = Account.find(@account_id)
    begin
      Category.transaction do
        @category = Category.new category_params
        @category.color_hex = "#4b7be5" if @category.color_hex.empty?
        @category.account = category_account
        @category.save!
      end
    rescue Exception => e
      error = e
    end
    respond_to do |format|
      if error.nil?
        @categories = policy_scope(Category).where(account_id: @account_id)
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
      format.turbo_stream
    end
  end

  def cancel_new
    @categories = policy_scope(Category)
    @account_id = params[:account_id] || current_account.id
    respond_to do |format|
      format.turbo_stream
    end
  end

  def update

    respond_to do |format|
      if @category.update(name: params[:category][:name], color_hex: params[:category][:color_hex])
        @notice = "Category updated successfully."
        @locations = policy_scope(Location).joins(:categories_locations).where(categories_locations: { category_id: @category.id })
      else
        @notice = "Error updating your category. Please try again later."
      end
      format.turbo_stream
    end
  end

  def destroy
    policy_scope(CategoriesLocation).where(category_id: @category.id).destroy_all
    respond_to do |format|
      if @category.destroy
        @categories = policy_scope(Category)
        @categories = if current_account.is_all_accounts?
                        categories_by_account
                      else
                        @categories.where(account_id: current_account.id)
                      end
        @account_id = @category.account.id
        @locations = policy_scope(Location).joins(:categories_locations).where(categories_locations: { category_id: @category.id })
        @notice = "Category deleted successfully."
        format.turbo_stream
      else
        format.html { redirect_to "/locations", notice: "Error deleting your category. Please try again later." }
      end
    end
  end

  def import_from_another_account
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
        @notice = "All categories were successfully imported."
        @categories = policy_scope(Category)
        if current_account.is_all_accounts?
          @categories = categories_by_account
        end
      else
        @notice = error
      end
      format.turbo_stream
    end
  end

  private

  def set_category
    @category = policy_scope(Category).find(params[:id])
  end

  def category_params
    params.require(:category).permit(:name, :color_hex, :account_id)
  end

  def categories_by_account
    @categories = @categories.group_by(&:account)
    accounts = policy_scope(Account)
    accounts.each do |account|
      @categories[account] = [] unless @categories[account]
    end
    @categories
  end
end
