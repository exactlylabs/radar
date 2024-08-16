class DashboardController < ApplicationController
  include ChartsHelper
  include Onboarding
  include DashboardConcern
  before_action :authenticate_user!
  before_action :set_params_and_interval_type, only: [:online_pods, :download_speeds, :upload_speeds, :latency, :data_usage, :total_data]

  # GET /dashboard or /dashboard.json
  def index
    if params[:new_account].present? && params[:new_account] == 'true'
      new_account_name = policy_scope(Account).last.name
      @notice = "#{new_account_name} was successfully created."
    end
    @clients = policy_scope(Client)
    locations_to_filter = policy_scope(Location)
    @locations = get_filtered_locations(locations_to_filter, params[:status])
    set_onboarding_step
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
    set_as_orgs
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
    sort_by = params[:sort_by]
    @locations = policy_scope(Location)
    @locations = @locations.where("locations.name ILIKE ?", "%#{query}%") if query
    @locations = get_filtered_locations(@locations, status)

    if sort_by.nil? || sort_by == 'name'
      @locations = @locations.order(:name)
    elsif sort_by == 'status'
      @locations = @locations.order(online: :desc)
    elsif sort_by == 'account'
      @locations = @locations.joins(:account).order('accounts.name')
    elsif sort_by == 'isp'
      @locations = @locations.left_outer_joins(clients: :autonomous_system).order('autonomous_systems.name')
    end

    if params[:account_id]
      @locations = @locations.where(account_id: params[:account_id])
    end

    if params[:network_id]
      @locations = @locations.where(id: params[:network_id])
    end

    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end

  def online_pods
    sql = DashboardHelper.get_online_pods_sql(@params[:from], @params[:to], @params[:account_ids], as_org_ids: @params[:as_org_ids], location_ids: @params[:location_ids])
    @online_pods = ActiveRecord::Base.connection.execute(sql)
    set_query_time_interval(@online_pods)
  end

  def download_speeds
    sql = DashboardHelper.get_download_speed_sql(@params[:account_ids], @params[:from], @params[:to], as_org_ids: @params[:as_org_ids], location_ids: @params[:location_ids])
    @download_speeds = ActiveRecord::Base.connection.execute(sql)
    set_query_time_interval(@download_speeds)
  end

  def upload_speeds
    sql = DashboardHelper.get_upload_speed_sql(@params[:account_ids], @params[:from], @params[:to], as_org_ids: @params[:as_org_ids], location_ids: @params[:location_ids])
    @upload_speeds = ActiveRecord::Base.connection.execute(sql)
    set_query_time_interval(@upload_speeds)
  end

  def latency
    sql = DashboardHelper.get_latency_sql(@params[:account_ids], @params[:from], @params[:to], as_org_ids: @params[:as_org_ids], location_ids: @params[:location_ids])
    @latencies = ActiveRecord::Base.connection.execute(sql)
    set_query_time_interval(@latencies)
  end

  def data_usage
    sql = DashboardHelper.get_usage_sql(@params[:interval_type], @params[:from], @params[:to], @params[:account_ids], as_org_ids: @params[:as_org_ids], location_ids: @params[:location_ids])
    @usage = ActiveRecord::Base.connection.execute(sql)
  end

  def total_data
    if current_account.is_all_accounts?
      sql = DashboardHelper.get_all_accounts_data_sql(@params[:from], @params[:to], @params[:account_ids], as_org_ids: @params[:as_org_ids], location_ids: @params[:location_ids])
    else
      sql = DashboardHelper.get_total_data_sql(@params[:from], @params[:to], @params[:account_ids], as_org_ids: @params[:as_org_ids], location_ids: @params[:location_ids])
    end
    @total_data = ActiveRecord::Base.connection.execute(sql)
  end

  def outages
    params = outages_params(current_account)
    sql = DashboardHelper.get_outages_sql(params[:from], params[:to], params[:account_ids], params[:location_ids], params[:outage_type], params[:as_org_ids])
    @outages = ActiveRecord::Base.connection.execute(sql)
    @outages_count = @outages.count
    @outages_ids = @outages.map { |outage| outage['id'] }
    if @outages_count > 0
      @outages = OutagesHelper.join_by_parent(@outages)
      @outages = OutagesHelper.group_outages(@outages)
      @downtime = @outages.map {|_, v| v[:duration] }.sum

      if @outages[0][:started_at] < params[:from]
        @downtime -= (params[:from] - @outages[0][:started_at])
      end

      downtime_percentage = @downtime / (params[:to] - params[:from]) * 100
      @uptime_percentage = (100 - downtime_percentage).round(2)
      @uptime_percentage = 0 if @uptime_percentage < 0
    else
      @downtime = 0
      @uptime_percentage = 100
    end
  end

  def all_filters
    if current_account.present?
      params = as_orgs_filters_params(current_account)
      @filter_as_orgs = ActiveRecord::Base.connection.execute(DashboardHelper.get_as_orgs_sql(params[:account_ids], params[:from], params[:to], location_ids: params[:network_id]))
    end
  end

  private

  def set_query_time_interval(data)
    if data.count > 1
      diff_between_dots = (data[1]['x'].to_i - data[0]['x'].to_i) / 1000 # in seconds
      if diff_between_dots >= 1.day.in_seconds
        @query_time_interval = 'day'
      elsif diff_between_dots >= 1.hour.in_seconds
        @query_time_interval = 'hour'
      elsif diff_between_dots >= 1.minute.in_seconds
        @query_time_interval = 'minute'
      else
        @query_time_interval = 'second'
      end
    else
      @query_time_interval = 'second'
    end
  end

  def set_params_and_interval_type
    case request.path
    when online_pods_path
      params_fn = method(:online_pods_params)
    when download_speeds_path
      params_fn = method(:download_speeds_params)
    when upload_speeds_path
      params_fn = method(:upload_speeds_params)
    when latency_path
      params_fn = method(:latency_params)
    when data_usage_path
      params_fn = method(:data_usage_params)
    when total_data_path
      params_fn = method(:total_data_params)
    end
    @params = params_fn.call(current_account)
    set_query_interval_type(@params)
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
