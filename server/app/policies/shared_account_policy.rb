class SharedAccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      # Super user & regular user are supposed to see the exact same thing
      if @auth_holder.present?
        scope.where(original_account_id: @auth_holder.account.id)
      else
        scope.none
      end
    end
  end
end