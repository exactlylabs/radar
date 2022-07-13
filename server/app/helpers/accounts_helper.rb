module AccountsHelper
  def is_current_active_account?(account)
    account.id == @current_account.id
  end
end