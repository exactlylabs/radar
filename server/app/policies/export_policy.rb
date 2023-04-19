# Headless policy
# https://www.rubydoc.info/gems/pundit#:~:text=edit_post_path(%40post)%20%25%3E%0A%3C%25%20end%20%25%3E-,Headless%20policies,-Given%20there%20is
class ExportPolicy < ApplicationPolicy
  def all?
    return false if @user_account&.is_all_accounts?
    @user_account.account.exportaccount
  end
end