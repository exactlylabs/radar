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
      @notification_settings = NotificationSettings.create(user: current_user, account: current_account)
    end
  end

  def update_notification_preferences_by_id(option_id, is_enabled)
    case option_id
    when 'email_notifications_enabled'
      @notification_settings.update(email_notifications_enabled: is_enabled)
    when 'pod_loses_total_connectivity'
      @notification_settings.update(pod_loses_total_connectivity: is_enabled)
    when 'pod_recovers_total_connectivity'
      @notification_settings.update(pod_recovers_total_connectivity: is_enabled)
    when 'pod_loses_partial_connectivity'
      @notification_settings.update(pod_loses_partial_connectivity: is_enabled)
    when 'pod_recovers_partial_connectivity'
      @notification_settings.update(pod_recovers_partial_connectivity: is_enabled)
    when 'significant_speed_variation'
      @notification_settings.update(significant_speed_variation: is_enabled)
    when 'isp_goes_offline'
      @notification_settings.update(isp_goes_offline: is_enabled)
    when 'isp_comes_back_online'
      @notification_settings.update(isp_comes_back_online: is_enabled)
    else
      false
    end
  end
end
