class CategoryPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @user_account.present?
        scope.where(account_id: @user_account.account.id)
      else
        scope.none
      end
    end
  end
end