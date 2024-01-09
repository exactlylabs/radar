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

  def online_pods
    sql = DashboardHelper.get_online_pods_sql
    sql = replace_shared_params(sql)
    sql = replace_online_pods_time_params(sql)
    @online_pods = ActiveRecord::Base.connection.execute(sql)
  end

  def download_speeds
    sql = DashboardHelper.get_download_speed_sql
    sql = replace_speed_time_params(sql)
    @download_speeds = ActiveRecord::Base.connection.execute(replace_shared_params(sql))
  end

  def upload_speeds
    sql = DashboardHelper.get_upload_speed_sql
    sql = replace_speed_time_params(sql)
    @upload_speeds = ActiveRecord::Base.connection.execute(replace_shared_params(sql))
  end

  def latency
    sql = DashboardHelper.get_latency_sql
    sql = replace_speed_time_params(sql)
    @latencies = ActiveRecord::Base.connection.execute(replace_shared_params(sql))
  end

  def data_usage
    sql = DashboardHelper.get_usage_sql
    sql = replace_shared_params(sql)
    sql = replace_data_usage_time_params(sql)
    @usage = ActiveRecord::Base.connection.execute(sql)
  end

  private
  def replace_online_pods_time_params(sql)
    days = params[:days].present? ? params[:days] : 30

    if params[:start].present? && params[:end].present?
      start_time = params[:start].to_i
      end_time = params[:end].to_i
      start_date = Time.at(start_time / 1000)
      end_date = Time.at(end_time / 1000)
      days_between = (end_date - start_date) / 1.day.in_seconds
      sql = sql.gsub('$interval_type', days_between > 10 ? 'd' : 'hour')
      sql = sql.gsub('$from::timestamp', "TIMESTAMP 'epoch' + #{start_time} * INTERVAL '1 millisecond'")
      sql = sql.gsub('$to::timestamp', "TIMESTAMP 'epoch' + #{end_time} * INTERVAL '1 millisecond'")
      sql = sql.gsub('$from', "TIMESTAMP 'epoch' + #{start_time} * INTERVAL '1 millisecond'")
      sql = sql.gsub('$to', "TIMESTAMP 'epoch' + #{end_time} * INTERVAL '1 millisecond'")
    else
      sql = sql.gsub('$interval_type', 'd')
      sql = sql.gsub('$from', "(NOW() - INTERVAL \'#{days} days\')")
      sql = sql.gsub('$to', 'NOW()')
    end
    sql
  end

  def replace_data_usage_time_params(sql)
    days = params[:days].present? ? params[:days] : 30
    sql = sql.gsub('$interval_type', 'd')
    if params[:start].present? && params[:end].present?
      start_time = params[:start].to_i
      end_time = params[:end].to_i
      sql = sql.gsub('$from', "TIMESTAMP 'epoch' + #{start_time} * INTERVAL '1 millisecond'")
      sql = sql.gsub('$to', "TIMESTAMP 'epoch' + #{end_time} * INTERVAL '1 millisecond'")
    else
      sql = sql.gsub('$from', "(NOW() - INTERVAL \'#{days} days\')")
      sql = sql.gsub('$to', 'NOW()')
    end
    sql
  end

  def replace_speed_time_params(sql)
    days = params[:days].present? ? params[:days] : 30
    if params[:start].present? && params[:end].present?
      start_time = params[:start].to_i
      end_time = params[:end].to_i
      sql = sql.gsub('$from::timestamp', "TIMESTAMP 'epoch' + #{start_time} * INTERVAL '1 millisecond'")
      sql = sql.gsub('$to::timestamp', "TIMESTAMP 'epoch' + #{end_time} * INTERVAL '1 millisecond'")
    else
      sql = sql.gsub('$from', "(NOW() - INTERVAL \'#{days} days\')")
      sql = sql.gsub('$to', 'NOW()')
    end
    sql
  end

  def replace_shared_params(sql)
    has_param_account_ids = params[:account_id].present? ? 1 : -1
    has_param_asn_org_ids = params[:isp_id].present? ? 1 : -1
    has_param_location_ids = params[:network_id].present? ? 1 : -1
    account_ids = has_param_account_ids == 1 ? params[:account_ids] : current_account.is_all_accounts? ? policy_scope(Account).pluck(:id).join(',') : current_account.id
    autonomous_system_org_ids = has_param_asn_org_ids == 1 ? params[:isp_id] : policy_scope(AutonomousSystemOrg).pluck(:id).join(',')
    location_ids = has_param_location_ids == 1 ? params[:network_id] : policy_scope(Location).pluck(:id).join(',')
    sql = sql.gsub('$account_ids', "#{account_ids}")
    sql = sql.gsub('$as_orgs', "#{autonomous_system_org_ids}")
    sql = sql.gsub('$location_ids', "#{location_ids}")
    sql = sql.gsub('$param_asn_org_ids', "'#{has_param_asn_org_ids}'")
    sql = sql.gsub('$param_location_ids', "'#{has_param_location_ids}'")
    sql.gsub('$param_account_ids', "'#{has_param_account_ids}'")
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
