# frozen_string_literal: true

class NotificationSettingsPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        scope.find_by(user: @auth_holder.user, account: @auth_holder.account)
      else
        scope.none
      end
    end
  end
end
