class DashboardController < ApplicationController
  before_action :authenticate_user!

  # GET /dashboard or /dashboard.json
  def index
    if params[:new_account].present? && params[:new_account] == 'true'
      new_account_name = policy_scope(Account).last.name
      @notice = "#{new_account_name} was successfully created."
    end
    @clients = policy_scope(Client)
    locations_to_filter = policy_scope(Location)
    @locations = get_filtered_locations(locations_to_filter, params[:status])
    if @locations.exists? || params[:filter].present?
      @onboard_step = -1
    elsif @clients.exists?
      @onboard_step = 3
    else
      @onboard_step = 1
    end
    if FeatureFlagHelper.is_available('networks', current_user)
      cookie = get_cookie(:ftue_onboarding_modal)
      if current_user.ftue_disabled
        if cookie.nil?
          set_cookie(:ftue_onboarding_modal, false)
        end
      else
        has_no_accounts = policy_scope(Account).count == 0
        cookie_is_turned_on = cookie.present? && cookie == 'true'
        if cookie.nil?
          set_cookie(:ftue_onboarding_modal, has_no_accounts)
          cookie_is_turned_on = has_no_accounts
        end
        @show_ftue = cookie_is_turned_on && has_no_accounts
      end
    end
  end

  def onboarding_step_1
    respond_to do |format|
      format.turbo_stream
    end
  end

  def onboarding_step_2
    respond_to do |format|
      format.turbo_stream
    end
  end

  def onboarding_step_3
    respond_to do |format|
      format.turbo_stream
    end
  end

  def search_locations
    query = params[:query]
    status = params[:status]
    @locations = policy_scope(Location)
    @locations = @locations.where("name ILIKE ?", "%#{query}%") if query
    @locations = get_filtered_locations(@locations, status)
    respond_to do |format|
      format.turbo_stream
    end
  end

  private

  def get_filtered_locations(locations, filter)
    case filter
    when nil, 'all'
      locations
    when 'online'
      locations.where_online
    else
      locations.where_offline
    end
  end
end
