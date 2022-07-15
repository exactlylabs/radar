class AccountsController < ApplicationController
  before_action :authenticate_user!
  before_action :check_user_is_allowed, except: %i[ create ]

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

  def edit
    @account = Account.find(params[:id])
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.update('edit_account_modal', template: "accounts/edit", locals: { account: @account })
      end
      format.html
    end
  end

  def update
    @account = Account.find(params[:id])
    respond_to do |format|
      if @account.update(account_params)
        format.html { redirect_back fallback_location: root_path, notice: "Account was successfully updated." }
      else
        format.html { render :edit, status: :unprocessable_entity }
      end
    end
  end

  private
  def account_params
    params.require(:account).permit(:name, :account_type)
  end

  def check_user_is_allowed
    unless UsersAccount.is_user_allowed(params[:id], current_user.id)
      head(401)
    end
  end
end