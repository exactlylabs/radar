class UpdateGroupPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present? && @auth_holder.user.super_user && !@auth_holder.is_super_user_disabled?
        UpdateGroup.all
      else
        scope.none
      end
    end
  end
end