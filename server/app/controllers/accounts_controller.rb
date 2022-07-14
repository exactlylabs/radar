class AccountsController < ApplicationController
  before_action :authenticate_user!

  def create
    @account = Account.create account_params
    @account.save!
    @user_account = UsersAccount.create(user_id: current_user.id, account_id: @account.id, joined_at: Time.now)
    if @user_account.save
      render json: { status: :ok, account_id: @account.id }
    else
      render json: { status: :unprocessable_entity }
    end
  end

  def account_params
    params.require(:account).permit(:name, :account_type)
  end
end