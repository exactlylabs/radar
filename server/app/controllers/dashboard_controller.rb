class DashboardController < ApplicationController
  before_action :authenticate_user!

  # GET /dashboard or /dashboard.json
  def index
    if params[:new_account].present? && params[:new_account] == 'true'
      new_account_name = policy_scope(Account).last.name
      @notice = "#{new_account_name} was successfully created."
    end
    @clients = policy_scope(Client)
    @locations = policy_scope(Location)
    @locations = get_filtered_locations(@locations)
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
    @locations = policy_scope(Location)
    @locations = @locations.where("name ILIKE ?", "%#{query}%") if query
    @locations = get_filtered_locations(@locations)
    respond_to do |format|
      format.turbo_stream
    end
  end

  private

  def get_filtered_locations(locations)
    locations = filter_locations_by_status(locations, params[:status]) if params[:status].present?
    locations = filter_locations_by_account(locations, params[:account]) if params[:account].present?
    locations = filter_locations_by_network(locations, params[:network]) if params[:network].present?
    locations = filter_locations_by_category(locations, params[:category]) if params[:category].present?
    locations = filter_locations_by_isp(locations, params[:isp]) if params[:isp].present?
    locations
  end

  def filter_locations_by_status(locations, status)
    case status
    when nil, 'all'
      locations
    when 'online'
      locations.where_online
    else
      locations.where_offline
    end
  end

  def filter_locations_by_account(locations, account_id)
    account = policy_scope(Account).find(account_id)
    locations.where(account: account)
  end

  def filter_locations_by_category(locations, category_id)
    locations.joins(:categories_locations).where(categories_locations: {category_id: category_id})
  end

  def filter_locations_by_network(locations, network_id)
    locations.where(id: network_id)
  end

  def filter_locations_by_isp(locations, isp_id)
    locations.joins(:location_metadata_projection).where("location_metadata_projections.autonomous_system_org_id = ?", isp_id)
  end
end
