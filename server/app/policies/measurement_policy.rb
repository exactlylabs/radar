# Headless policy
# https://www.rubydoc.info/gems/pundit#:~:text=edit_post_path(%40post)%20%25%3E%0A%3C%25%20end%20%25%3E-,Headless%20policies,-Given%20there%20is
class MeasurementPolicy < ApplicationPolicy
  def index?
    true
  end

  def full_index?
    @user_account.account.superaccount || @user_account.account.exportaccount
  end

  def full_ndt7_index?
    @user_account.account.superaccount || @user_account.account.exportaccount
  end
end