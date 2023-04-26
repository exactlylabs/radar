class ClientVersionPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present? && @auth_holder.user.super_user
        ClientVersion.all
      else
        scope.none
      end
    end
  end
end