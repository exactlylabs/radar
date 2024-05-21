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
    @notice = if update_notification_preferences_by_id(option_id, is_enabled)
                'Your notification settings have been saved.'
              else
                'Error updating notifications preferences. Please try again later.'
              end
  end

  private

  def set_notification_settings
    # check that's not in "All accounts" mode
    throw "Notification settings are not available in 'All accounts' mode." if current_account.is_all_accounts?

    @notification_settings = NotificationSettings.find_by(user: current_user, account: current_account)
    if @notification_settings.nil?
      user_notifications_settings = NotificationSettings.where(user: current_user)
      if user_notifications_settings.count > 0
        @notification_settings = user_notifications_settings.first.dup
        @notification_settings.account = current_account
        @notification_settings.save
      else
        @notification_settings = NotificationSettings.create(user: current_user, account: current_account)
      end
    end
  end

  def update_notification_preferences_by_id(option_id, is_enabled)
    case option_id
    when 'email_notifications_enabled'
      update_notification_settings_from_user_all_accounts('email_notifications_enabled', is_enabled)
    when 'pod_loses_total_connectivity'
      update_notification_settings_from_user_all_accounts('pod_loses_total_connectivity', is_enabled)
    when 'pod_recovers_total_connectivity'
      update_notification_settings_from_user_all_accounts('pod_recovers_total_connectivity', is_enabled)
    when 'pod_loses_partial_connectivity'
      update_notification_settings_from_user_all_accounts('pod_loses_partial_connectivity', is_enabled)
    when 'pod_recovers_partial_connectivity'
      update_notification_settings_from_user_all_accounts('pod_recovers_partial_connectivity', is_enabled)
    when 'significant_speed_variation'
      update_notification_settings_from_user_all_accounts('significant_speed_variation', is_enabled)
    when 'isp_goes_offline'
      update_notification_settings_from_user_all_accounts('isp_goes_offline', is_enabled)
    when 'isp_comes_back_online'
      update_notification_settings_from_user_all_accounts('isp_comes_back_online', is_enabled)
    else
      false
    end
  end

  def update_notification_settings_from_user_all_accounts(setting_name, setting_value)
    accounts = policy_scope(Account)
    accounts.each do |account|
      notification_settings = NotificationSettings.find_by(user: current_user, account: account)
      if notification_settings.nil?
        notification_settings = NotificationSettings.create(user: current_user, account: account)
      end
      notification_settings.update(setting_name => setting_value) if notification_settings.present?
    end
  end
end
