class UserPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.joins(:users_accounts).where("\"users_accounts\".\"account_id\" = #{@user_account.account.id}")
    end
  end
end