class UsersAccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(account_id: @user_account.account.id)
    end
  end
end