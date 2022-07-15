class AccountsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_account, except: %i[ create ]

  def create
    @account = Account.create account_params
    @account.save!
    now = Time.now
    @user_account = UsersAccount.create(user_id: current_user.id, account_id: @account.id, joined_at: now, invited_at: now)
    if @user_account.save
      set_cookie(:radar_current_account_id, @account.id)
      render json: { status: :ok }
    else
      render json: { status: :unprocessable_entity }
    end
  end

  def delete
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.update('delete_account_modal', template: "accounts/delete", locals: { account: @account })
      end
      format.html
    end
  end

  def destroy
    users_accounts = @account.users_accounts
    now = Time.now
    respond_to do |format|
      if @account.update(deleted_at: now) && users_accounts.update_all(deleted_at: now)
        format.html { redirect_back fallback_location: root_path, notice: "Account was successfully deleted." }
      else
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  def edit
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.update('edit_account_modal', template: "accounts/edit", locals: { account: @account })
      end
      format.html
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
    set_user_account new_account if new_account
    set_cookie(:radar_current_account_id, new_account_id)
  end

  private
  def account_params
    params.require(:account).permit(:name, :account_type)
  end

  def set_account
    @account = policy_scope(Account).find(params[:id])
  end
end