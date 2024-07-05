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
        params[:page_size],
        params[:location_id],
        params[:outage_type],
        params[:as_org_id]
      )
      @outage_ids = ActiveRecord::Base.connection.execute(sql)

      @outages = OutageEvent.where(id: @outage_ids.map { |outage| outage['id'] })
                            .order(started_at: :asc)
                            .joins("JOIN network_outages ON network_outages.outage_event_id = outage_events.id")
                            .joins("JOIN locations ON locations.id = network_outages.location_id")
                            .joins("JOIN autonomous_systems ON autonomous_systems.id = outage_events.autonomous_system_id")
                            .select("
        network_outages.autonomous_system_id,
      CASE
        WHEN outage_events.outage_type = 0 THEN 'unknown_reason'
        WHEN outage_events.outage_type = 1 THEN 'network_failure'
        WHEN outage_events.outage_type = 2 THEN 'isp_outage'
        ELSE 'power_outage' END as outage_type,
      outage_events.started_at,
      CASE
        WHEN outage_events.status = 0 THEN NOW()
        ELSE outage_events.resolved_at END as resolved_at,
      CASE
        WHEN outage_events.status = 0 THEN EXTRACT(EPOCH FROM NOW() - outage_events.resolved_at) * 1000
        ELSE EXTRACT(EPOCH FROM outage_events.resolved_at - outage_events.started_at) * 1000 END as duration")

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