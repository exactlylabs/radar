# frozen_string_literal: true

class NotificationSettingsPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      if @auth_holder.present?
        notification_settings = scope.find_by(user: @auth_holder.user, account: @auth_holder.account)
        if notification_settings.nil?
          user_notifications_settings = NotificationSettings.where(user: @auth_holder.user)
          if user_notifications_settings.count > 0
            notification_settings = user_notifications_settings.first.dup
            notification_settings.account = @auth_holder.account
            notification_settings.save
          else
            notification_settings = NotificationSettings.create(user: @auth_holder.user, account: @auth_holder.account)
          end
        end
        notification_settings
      else
        scope.none
      end
    end
  end
end
