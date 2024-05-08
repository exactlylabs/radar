class ComparisonDashboardController < ApplicationController
  include ChartsHelper
  before_action :authenticate_user!

  def index
    @clients = policy_scope(Client)
    @locations = policy_scope(Location)
    if @locations.exists? || params[:filter].present?
      @onboard_step = -1
    elsif @clients.exists?
      @onboard_step = 3
    else
      @onboard_step = 1
    end

    if current_account.present?
      params = as_orgs_filters_params(current_account)
      @filter_as_orgs = ActiveRecord::Base.connection.execute(DashboardHelper.get_as_orgs_sql(params[:account_ids], params[:from], params[:to], location_ids: params[:location_ids]))
    end
  end

  def online_pods
    params = online_pods_params(current_account)
    sql = DashboardHelper.get_online_pods_sql(params[:interval_type], params[:from], params[:to], params[:account_ids], as_org_ids: params[:as_org_ids], location_ids: params[:location_ids])
    @online_pods = ActiveRecord::Base.connection.execute(sql)
  end

end