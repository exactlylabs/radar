class CategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_category, except: [:index, :new, :cancel_new, :create, :import_from_another_account, :import]

  def index
    query = params[:query]
    @categories = policy_scope(Category)

    if query
      @categories = @categories.where("name ILIKE ?", "%#{query}%")
    end

    # add to the map the accounts that don't have any categories.
    if current_account.is_all_accounts?
      # categories should be a map where the account is the key and the value is an array of categories
      @categories = categories_by_account
    end

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def new
    @account_id = params[:account_id] || current_account.id
    puts "Account ID: #{@account_id}"
    respond_to do |format|
      format.turbo_stream
    end
  end

  def create
    error = nil
    @account_id = params[:account_id] || current_account.id
    category_account = if params[:account_id].present?
                         Account.find(params[:account_id])
                       else
                         current_account
                       end

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
        format.turbo_stream
      else
        format.html { redirect_to "/locations", notice: "Error updating your category. Please try again later." }
      end
    end
  end

  def destroy
    policy_scope(CategoriesLocation).where(category_id: @category.id).destroy_all
    respond_to do |format|
      if @category.destroy
        @categories = policy_scope(Category)
        @categories = categories_by_account
        @account_id = params[:account_id] || current_account.id
        @notice = "Category deleted successfully."
        format.turbo_stream
      else
        format.html { redirect_to "/locations", notice: "Error deleting your category. Please try again later." }
      end
    end
  end

  def import_from_another_account
    @categories = categories_for_import
    @categories = categories_by_account
    respond_to do |format|
      format.html
    end
  end

  def import
    categories_ids = params[:categories]
    import_to_account = params[:import_to] || current_account.id
    error = nil
    begin
      Category.transaction do
        categories_ids.each do |category_id|
          next unless category_id.present?

          category = Category.find(category_id)
          new_category = category.dup
          new_category.account_id = import_to_account
          new_category.save!
        end
      end
    rescue Exception => e
      error = e
    end
    respond_to do |format|
      if error.nil?
        @categories = policy_scope(Category)
        @categories = categories_by_account
        format.turbo_stream
      else
        format.html { redirect_to "/locations", notice: "Error importing categories. Please try again later." }
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

  def categories_by_account
    @categories.group_by(&:account)
    @categories = @categories.group_by(&:account)
    accounts = policy_scope(Account)
    accounts.each do |account|
      @categories[account] = [] unless @categories[account]
    end
    @categories
  end

  def categories_for_import
    user = current_user
    all_categories = []
    user.accounts.not_deleted.each do |account|
      all_categories.append(*account.categories.pluck(:id))
    end
    user.shared_accounts.not_deleted.each do |account|
      all_categories.append(*account.categories.pluck(:id))
    end
    Category.where(id: all_categories)
  end
end
