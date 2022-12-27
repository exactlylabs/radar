# Headless policy
# https://www.rubydoc.info/gems/pundit#:~:text=edit_post_path(%40post)%20%25%3E%0A%3C%25%20end%20%25%3E-,Headless%20policies,-Given%20there%20is
class MeasurementPolicy < ApplicationPolicy

  class Scope < Scope
    def resolve
      if @user_account.present?
        scope.where(account_id: @user_account.account_id) # Prevent from seeing tests from different accounts where the test wasn't taken
      else
        scope.none
      end
    end
  end

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