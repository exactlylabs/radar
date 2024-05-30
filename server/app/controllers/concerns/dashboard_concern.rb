module DashboardConcern extend ActiveSupport::Concern
include ChartsHelper

  def set_as_orgs
    if current_account.present?
      params = as_orgs_filters_params(current_account)
      @filter_as_orgs = ActiveRecord::Base.connection.execute(DashboardHelper.get_as_orgs_sql(params[:account_ids], params[:from], params[:to], location_ids: params[:location_ids]))
    end
  end
end