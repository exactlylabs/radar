class UsersAccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where(user_id: current_user.user_id)
    end
  end
end