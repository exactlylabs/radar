class SharedAccountPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present? && @auth_holder.user.super_user
        scope.all
      elsif @auth_holder.present?
        scope.where(original_account_id: @auth_holder.account.id)
      else
        scope.none
      end
    end
  end
end