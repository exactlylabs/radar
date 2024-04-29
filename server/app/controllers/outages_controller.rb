class OutagesController < ApplicationController
  def detail_modal

    if params[:ids].present?
      @outages = OutageEvent.where(id: params[:ids])
    end

    if params[:outage_type].present? && OutageEvent.outage_types.keys.include?(params[:outage_type])
      @outages = @outages.where(outage_type: OutageEvent.outage_types[params[:outage_type]])
    end

    @outages = @outages.order(:started_at)

    @outages = OutagesHelper.group_outages(@outages)

    # Just leaving this comment until this specific part is implemented (it's up for review)
    # if params[:search].present?
    #   @outages = @outages.joins(:autonomous_system).where("autonomous_systems.asn = ? OR autonomous_systems.name ILIKE ?", params[:search], "%#{params[:search]}%")
    # end

    respond_to do |format|
      format.turbo_stream
      format.html
    end
  end
end