class DashboardController < ApplicationController
  include ChartsHelper
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
    if FeatureFlagHelper.is_available('charts', current_user)
      @locations = @locations.where(account_id: params[:account_id]) if params[:account_id]
      @locations = @locations.where(id: params[:network_id]) if params[:network_id]
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
    if current_account.present?
      params = as_orgs_filters_params(current_account)
      @filter_as_orgs = ActiveRecord::Base.connection.execute(DashboardHelper.get_as_orgs_sql(params[:account_ids], params[:from], params[:to], location_ids: params[:location_ids]))
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

  def online_pods
    params = online_pods_params(current_account)
    sql = DashboardHelper.get_online_pods_sql(params[:interval_type], params[:from], params[:to], params[:account_ids], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    @online_pods = ActiveRecord::Base.connection.execute(sql)
  end

  def download_speeds
    params = download_speeds_params(current_account)
    sql = DashboardHelper.get_download_speed_sql(params[:account_ids], params[:from], params[:to], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    @download_speeds = ActiveRecord::Base.connection.execute(sql)
  end

  def upload_speeds
    params = upload_speeds_params(current_account)
    sql = DashboardHelper.get_upload_speed_sql(params[:account_ids], params[:from], params[:to], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    @upload_speeds = ActiveRecord::Base.connection.execute(sql)
  end

  def latency
    params = latency_params(current_account)
    sql = DashboardHelper.get_latency_sql(params[:account_ids], params[:from], params[:to], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    @latencies = ActiveRecord::Base.connection.execute(sql)
  end

  def data_usage
    params = data_usage_params(current_account)
    sql = DashboardHelper.get_usage_sql(params[:interval_type], params[:from], params[:to], params[:account_ids], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    @usage = ActiveRecord::Base.connection.execute(sql)
  end

  def total_data
    params = total_data_params(current_account)
    if current_account.is_all_accounts?
      sql = DashboardHelper.get_all_accounts_data_sql(params[:from], params[:to], params[:account_ids], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    else
      sql = DashboardHelper.get_total_data_sql(params[:from], params[:to], params[:account_ids], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    end
    @total_data = ActiveRecord::Base.connection.execute(sql)
  end

  def outages
    @outages = [1] # TODO: Implement outages mock data
  end

  private

  def policy_filter_ids(model, ids)
    policy_scope(model).where(id: ids).pluck(:id).join(',')
  end

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
