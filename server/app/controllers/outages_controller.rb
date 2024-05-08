class OutagesController < ApplicationController
  include ChartsHelper

  def detail_modal
    @total_count = params[:total_count].to_i
    @grouped = params[:grouped] == 'true'

    if @total_count >= 10 * params[:page].to_i
      params = outages_params(current_account)
      sql = DashboardHelper.get_outage_ids_sql(
        params[:from],
        params[:to],
        params[:account_ids],
        params[:page],
        params[:location_id],
        params[:outage_type],
        params[:as_org_id]
      )
      @outage_ids = ActiveRecord::Base.connection.execute(sql)

      @outages = OutageEvent.where(id: @outage_ids.map { |outage| outage['id'] }).order(started_at: :asc)

      @outages = OutagesHelper.group_outages(@outages, 'desc', @grouped)
    else
      @outages = {}
    end

    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end
end