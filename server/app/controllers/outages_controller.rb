class OutagesController < ApplicationController
  include ChartsHelper

  def detail_modal
    @page = params[:page].to_i || 0
    @total_count = params[:total_count].to_i
    @grouped = params[:grouped] == 'true'

    if @total_count >= 10 * params[:page].to_i
      params = outages_params(current_account)
      sql = DashboardHelper.get_outage_ids_sql(
        params[:from],
        params[:to],
        params[:account_ids],
        params[:page],
        params[:page_size],
        params[:location_id],
        params[:outage_type],
        params[:as_org_id]
      )
      @outage_ids = ActiveRecord::Base.connection.execute(sql)

      @outages = OutageEvent.where(id: @outage_ids.map { |outage| outage['id'] })
                            .order(started_at: :asc)
                            .joins(:network_outages => [:location])
                            .joins(:autonomous_system)
                            .select("
        outage_events.id,
        network_outages.autonomous_system_id,
        outage_events.outage_type,
        outage_events.started_at,
        COALESCE(outage_events.resolved_at, NOW()) AS resolved_at,
        EXTRACT(EPOCH FROM COALESCE(outage_events.resolved_at, NOW()) - outage_events.started_at) * 1000 AS duration
      ")
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