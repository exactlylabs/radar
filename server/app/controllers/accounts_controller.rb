class AccountsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_account, except: %i[ create, new ]

  def new
    @account = Account.new
    respond_to do |format|
      format.html
      format.turbo_stream { render turbo_stream: turbo_stream.update('create_account_modal', partial: "accounts/create/create_modal", locals: { account: @account }) }
    end
  end

  def new_account_onboarding
    @account = Account.new
    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def onboarding_account
    @error = false
    shared_to_accounts_ids = params[:shared_to_accounts_ids].present? ? JSON.parse(params[:shared_to_accounts_ids]) : []
    begin
      Account.transaction do
        @account = Account.create! account_params
        now = Time.now
        @user_account = UsersAccount.create!(user_id: current_user.id, account_id: @account.id, joined_at: now, invited_at: now)
        shared_to_accounts_ids.each do |id|
          new_shared_account = SharedAccount.new
          new_shared_account.original_account_id = @account.id
          new_shared_account.shared_to_account_id = id.to_i
          new_shared_account.shared_at = Time.now
          new_shared_account.save!
        end
      end
    rescue Exception => e
      @error = e.message
    end
    if !@error
      current_user.update(ftue_disabled: true)
      set_cookie(:radar_current_account_id, @account.id)
    end
    respond_to do |format|
      format.turbo_stream
    end
  end

  def create
    error = false
    shared_to_accounts_ids = params[:shared_to_accounts_ids].present? ? JSON.parse(params[:shared_to_accounts_ids]) : []
    begin
      Account.transaction do
        @account = Account.create! account_params
        now = Time.now
        @user_account = UsersAccount.create!(user_id: current_user.id, account_id: @account.id, joined_at: now, invited_at: now)
        shared_to_accounts_ids.each do |id|
          new_shared_account = SharedAccount.new
          new_shared_account.original_account_id = @account.id
          new_shared_account.shared_to_account_id = id.to_i
          new_shared_account.shared_at = Time.now
          new_shared_account.save!
        end
      end
    rescue Exception => e
      error = e.message
    end
    if !error
      set_cookie(:radar_current_account_id, @account.id)
      render json: { status: :ok }
    else
      render json: { status: :unprocessable_entity, msg: error }
    end
  end

  def delete
    respond_to do |format|
      format.html
      format.turbo_stream { render turbo_stream: turbo_stream.update('delete_account_modal', partial: "accounts/delete/delete_modal", locals: { account: @account }) }
    end
  end

  def destroy
    users_accounts = @account.users_accounts
    now = Time.now
    respond_to do |format|
      if @account.update(deleted_at: now) && users_accounts.update_all(deleted_at: now)
        # If user decides to delete currently selected account
        # then automatically switch over to a different available one
        if @account == current_account && !current_account.is_all_accounts?
          get_first_user_account_and_set_cookie
        end
        @notice = "Account was successfully deleted."
        format.turbo_stream
        format.html { redirect_to "/dashboard", notice: @notice }
      else
        format.html { redirect_back fallback_location: root_path, notice: "Error removing account. Please try again later." }
      end
    end
  end

  def edit
    respond_to do |format|
      format.html
      format.turbo_stream { render turbo_stream: turbo_stream.update('edit_account_modal', partial: "accounts/edit/edit_modal", locals: { account: @account }) }
    end
  end

  def add_member
    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def update
    respond_to do |format|
      if @account.update(account_params)
        format.html { redirect_back fallback_location: root_path, notice: "Account was successfully updated." }
      else
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  def switch
    new_account_id = params[:id]
    new_account = policy_scope(Account).find(new_account_id)
    set_new_account new_account if new_account
    set_cookie(:radar_current_account_id, new_account_id)
    @notice = "You are now viewing #{new_account.name} account."
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: @notice }
    end
  end

  def all_accounts
    set_all_accounts
  end

  private
  def account_params
    params.require(:account).permit(:name, :account_type)
  end

  def set_account
    if params[:id].nil? || params[:id] == -1
      @account = nil
    else
      @account = policy_scope(Account).find(params[:id])
    end
  end
end