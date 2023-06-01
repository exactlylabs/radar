class RecentSearchPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        scope.where(user_id: @auth_holder.user.id)
      else
        scope.none
      end
    end
  end
end