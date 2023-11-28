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
    has_param_asn_org_ids = params[:asn_org_ids].present? ? '1' : '-1'
    has_param_location_ids = params[:location_ids].present? ? '1' : '-1'
    account_ids = policy_scope(Account).pluck(:id).join(',')
    autonomous_system_org_ids = has_param_asn_org_ids == '1' ? params[:asn_org_ids] : policy_scope(AutonomousSystemOrg).pluck(:id).join(',')
    location_ids = has_param_location_ids == '1' ? params[:location_ids] : policy_scope(Location).pluck(:id).join(',')
    days = params[:days].present? ? params[:days] : 30
    sql = sql.gsub('$interval_type', 'd')
    sql = sql.gsub('$from', "(NOW() - INTERVAL \'#{days} days\')")
    sql = sql.gsub('$to', 'NOW()')
    sql = sql.gsub('$account_ids', account_ids)
    sql = sql.gsub('$as_orgs', autonomous_system_org_ids)
    sql = sql.gsub('$location_ids', location_ids)
    sql = sql.gsub('$params_asn_org_ids', has_param_asn_org_ids)
    sql = sql.gsub('$param_location_ids', has_param_location_ids)
    @online_pods = ActiveRecord::Base.connection.execute(sql)
  end

  def download_speeds
    sql = DashboardHelper.get_download_speed_sql
    has_param_account_ids = params[:account_ids].present? ? '1' : '-1'
    has_param_asn_org_ids = params[:asn_org_ids].present? ? '1' : '-1'
    has_param_location_ids = params[:location_ids].present? ? '1' : '-1'
    account_ids = has_param_account_ids == '1' ? params[:account_ids] : policy_scope(Account).pluck(:id).join(',')
    autonomous_system_org_ids = has_param_asn_org_ids == '1' ? params[:asn_org_ids] : policy_scope(AutonomousSystemOrg).pluck(:id).join(',')
    location_ids = has_param_location_ids == '1' ? params[:location_ids] : policy_scope(Location).pluck(:id).join(',')
    days = params[:days].present? ? params[:days] : 30
    sql = sql.gsub('$from', "(NOW() - INTERVAL \'#{days} days\')")
    sql = sql.gsub('$to', 'NOW()')
    sql = sql.gsub('$account_ids', account_ids)
    sql = sql.gsub('$as_orgs', autonomous_system_org_ids)
    sql = sql.gsub('$location_ids', location_ids)
    sql = sql.gsub('$param_asn_org_ids', "'#{has_param_asn_org_ids}'")
    sql = sql.gsub('$param_location_ids', "'#{has_param_location_ids}'")
    sql = sql.gsub('$param_account_ids', "'#{has_param_account_ids}'")
    @download_speeds = ActiveRecord::Base.connection.execute(sql)
  end

  def upload_speeds
    sql = DashboardHelper.get_upload_speed_sql
    has_param_account_ids = params[:account_ids].present? ? '1' : '-1'
    has_param_asn_org_ids = params[:asn_org_ids].present? ? '1' : '-1'
    has_param_location_ids = params[:location_ids].present? ? '1' : '-1'
    account_ids = has_param_account_ids == '1' ? params[:account_ids] : policy_scope(Account).pluck(:id).join(',')
    autonomous_system_org_ids = has_param_asn_org_ids == '1' ? params[:asn_org_ids] : policy_scope(AutonomousSystemOrg).pluck(:id).join(',')
    location_ids = has_param_location_ids == '1' ? params[:location_ids] : policy_scope(Location).pluck(:id).join(',')
    days = params[:days].present? ? params[:days] : 30
    sql = sql.gsub('$from', "(NOW() - INTERVAL \'#{days} days\')")
    sql = sql.gsub('$to', 'NOW()')
    sql = sql.gsub('$account_ids', account_ids)
    sql = sql.gsub('$as_orgs', autonomous_system_org_ids)
    sql = sql.gsub('$location_ids', location_ids)
    sql = sql.gsub('$param_asn_org_ids', "'#{has_param_asn_org_ids}'")
    sql = sql.gsub('$param_location_ids', "'#{has_param_location_ids}'")
    sql = sql.gsub('$param_account_ids', "'#{has_param_account_ids}'")
    @upload_speeds = ActiveRecord::Base.connection.execute(sql)
  end

  def latency
    sql = DashboardHelper.get_latency_sql
    has_param_account_ids = params[:account_ids].present? ? '1' : '-1'
    has_param_asn_org_ids = params[:asn_org_ids].present? ? '1' : '-1'
    has_param_location_ids = params[:location_ids].present? ? '1' : '-1'
    account_ids = has_param_account_ids == '1' ? params[:account_ids] : policy_scope(Account).pluck(:id).join(',')
    autonomous_system_org_ids = has_param_asn_org_ids == '1' ? params[:asn_org_ids] : policy_scope(AutonomousSystemOrg).pluck(:id).join(',')
    location_ids = has_param_location_ids == '1' ? params[:location_ids] : policy_scope(Location).pluck(:id).join(',')
    days = params[:days].present? ? params[:days] : 30
    sql = sql.gsub('$from', "(NOW() - INTERVAL \'#{days} days\')")
    sql = sql.gsub('$to', 'NOW()')
    sql = sql.gsub('$account_ids', account_ids)
    sql = sql.gsub('$as_orgs', autonomous_system_org_ids)
    sql = sql.gsub('$location_ids', location_ids)
    sql = sql.gsub('$param_asn_org_ids', "'#{has_param_asn_org_ids}'")
    sql = sql.gsub('$param_location_ids', "'#{has_param_location_ids}'")
    sql = sql.gsub('$param_account_ids', "'#{has_param_account_ids}'")
    @latencies = ActiveRecord::Base.connection.execute(sql)
  end

  def data_usage
    sql = DashboardHelper.get_usage_sql
    has_param_account_ids = params[:account_ids].present? ? '1' : '-1'
    has_param_asn_org_ids = params[:asn_org_ids].present? ? '1' : '-1'
    has_param_location_ids = params[:location_ids].present? ? '1' : '-1'
    account_ids = has_param_account_ids == '1' ? params[:account_ids] : policy_scope(Account).pluck(:id).join(',')
    autonomous_system_org_ids = has_param_asn_org_ids == '1' ? params[:asn_org_ids] : policy_scope(AutonomousSystemOrg).pluck(:id).join(',')
    location_ids = has_param_location_ids == '1' ? params[:location_ids] : policy_scope(Location).pluck(:id).join(',')
    days = params[:days].present? ? params[:days] : 30
    sql = sql.gsub('$interval_type', 'd')
    sql = sql.gsub('$from', "(NOW() - INTERVAL \'#{days} days\')")
    sql = sql.gsub('$to', 'NOW()')
    sql = sql.gsub('$account_ids', account_ids)
    sql = sql.gsub('$as_orgs', autonomous_system_org_ids)
    sql = sql.gsub('$location_ids', location_ids)
    sql = sql.gsub('$param_asn_org_ids', "'#{has_param_asn_org_ids}'")
    sql = sql.gsub('$param_location_ids', "'#{has_param_location_ids}'")
    sql = sql.gsub('$param_account_ids', "'#{has_param_account_ids}'")
    @usage = ActiveRecord::Base.connection.execute(sql)
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
