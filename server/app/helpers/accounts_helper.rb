module AccountsHelper
  def is_current_active_account?(account)
    puts account.id
    puts @current_account.id
    account.id == @current_account.id
  end
end