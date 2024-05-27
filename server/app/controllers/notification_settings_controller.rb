# frozen_string_literal: true

class NotificationSettingsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_notification_settings

  def index
  end

  def toggle_notification_option
    @notice = nil
    is_enabled = params[:is_enabled]
    option_id = params[:option_id]
    @notice = if update_notification_settings_from_user_all_accounts(option_id, is_enabled)
                'Your notification settings have been saved.'
              else
                'Error updating notifications preferences. Please try again later.'
              end
  end

  private

  def set_notification_settings
    @notification_settings = policy_scope(NotificationSettings)
    if @notification_settings.nil?
      user_notifications_settings = NotificationSettings.where(user: @auth_holder.user)
      if user_notifications_settings.count > 0
        @notification_settings = user_notifications_settings.first.dup
        @notification_settings.account = @auth_holder.account
        @notification_settings.save
      else
        @notification_settings = NotificationSettings.create(user: @auth_holder.user, account: @auth_holder.account)
      end
    end
    @notification_settings
  end

  def update_notification_settings_from_user_all_accounts(setting_name, setting_value)
    accounts = policy_scope(Account)
    notification_settings_updated = false
    accounts.each do |account|
      notification_settings = NotificationSettings.find_by(user: current_user, account: account)
      if notification_settings.nil?
        notification_settings = NotificationSettings.create(user: current_user, account: account)
      end
      notification_settings_updated = notification_settings.update(setting_name => setting_value) if notification_settings.present?
    end
    notification_settings_updated
  end
end
