class ComparisonDashboardController < ApplicationController
  include ChartsHelper
  include Onboarding
  include DashboardConcern
  before_action :authenticate_user!
  before_action :set_as_orgs

  def index
    @clients = policy_scope(Client)
    @locations = policy_scope(Location)
    set_onboarding_step
    set_as_orgs
  end

  def online_pods
    params = online_pods_params(current_account)
    sql = DashboardHelper.get_online_pods_sql(params[:interval_type], params[:from], params[:to], params[:account_ids], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    @online_pods = ActiveRecord::Base.connection.execute(sql)
  end

  def download_speeds
    params = compare_download_speeds_params(current_account)
    sql = DashboardHelper.get_compare_download_speed_sql(params[:from], params[:to], params[:compare_by], params[:curve_type], params[:account_ids], params[:as_org_ids], params[:location_ids], params[:pod_ids], params[:category_ids])
    @download_speeds = ActiveRecord::Base.connection.execute(sql)
  end

  def upload_speeds
    params = compare_upload_speeds_params(current_account)
    sql = DashboardHelper.get_compare_upload_speed_sql(params[:from], params[:to], params[:compare_by], params[:curve_type], params[:account_ids], params[:as_org_ids], params[:location_ids], params[:pod_ids], params[:category_ids])
    @upload_speeds = ActiveRecord::Base.connection.execute(sql)
  end

  def latency
    params = compare_latency_params(current_account)
    sql = DashboardHelper.get_compare_latency_sql(params[:from], params[:to], params[:compare_by], params[:curve_type], params[:account_ids], params[:as_org_ids], params[:location_ids], params[:pod_ids], params[:category_ids])
    @latency = ActiveRecord::Base.connection.execute(sql)
  end

  def data_usage
    params = compare_data_usage_params(current_account)
    sql = DashboardHelper.get_compare_data_usage_sql(params[:from], params[:to], params[:compare_by], params[:curve_type], params[:account_ids], params[:as_org_ids], params[:location_ids], params[:pod_ids], params[:category_ids])
    @data_usage = ActiveRecord::Base.connection.execute(sql)
  end

  def total_data
    params = compare_total_data_params(current_account)
    sql = DashboardHelper.get_compare_total_data_sql(params[:from], params[:to], params[:compare_by], params[:curve_type], params[:account_ids], params[:as_org_ids], params[:location_ids], params[:pod_ids], params[:category_ids])
    @total_data = ActiveRecord::Base.connection.execute(sql)
  end
end