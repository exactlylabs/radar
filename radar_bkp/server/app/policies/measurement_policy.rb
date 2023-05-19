# Headless policy
# https://www.rubydoc.info/gems/pundit#:~:text=edit_post_path(%40post)%20%25%3E%0A%3C%25%20end%20%25%3E-,Headless%20policies,-Given%20there%20is
class MeasurementPolicy < ApplicationPolicy

  class Scope < Scope
    def resolve
      if @auth_holder.present?
        if @auth_holder.is_all_accounts?
          scope.where('download IS NOT NULL')
        else
          scope.where(account_id: @auth_holder.account.id).where('download IS NOT NULL') # Prevent from seeing tests from different accounts where the test wasn't taken
        end
      else
        scope.none
      end
    end
  end

  def index?
    return false if @auth_holder.is_all_accounts?
    true
  end

  def full_index?
    return false if @auth_holder.is_all_accounts?
    @auth_holder.account.superaccount || @auth_holder.account.exportaccount
  end

  def full_ndt7_index?
    return false if @auth_holder.is_all_accounts?
    @auth_holder.account.superaccount || @auth_holder.account.exportaccount
  end
end