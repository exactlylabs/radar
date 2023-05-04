class CategoryPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        scope.where(account_id: @auth_holder.account.id)
      else
        scope.none
      end
    end
  end
end