class ClientDataUsageAndSchedulingController < ApplicationController
  before_action :authenticate_user!
  before_action :set_client

  # GET /clients/:unix_user/data_usage_and_scheduling
  def index
    @total_avg = @client.get_speed_averages(current_account.id)
  end

  # PUT clients/:unix_user/data_usage
  def edit_data_cap
    given_data_cap = params[:client][:data_cap_max_usage]

    # quick way to check if given value is a valid number
    if given_data_cap.to_i.to_s != given_data_cap
      given_data_cap = nil
    end

    wants_to_have_data_cap = params[:client][:wants_to_have_data_cap] === "on"

    if given_data_cap.present? && wants_to_have_data_cap
      @client.data_cap_max_usage = (given_data_cap.to_i * (1024**2)).round(0) # save the value in B (frontend asks for MB)
    else
      @client.data_cap_max_usage = nil
    end

    @client.data_cap_periodicity = params[:client][:data_cap_periodicity].to_i

    if @client.save
      notice = "Client's data cap was successfully saved."
    else
      notice = "Error saving client's data cap."
    end
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
      format.json { head :no_content }
    end
  end

  # PUT clients/:unix_user/scheduling
  def edit_scheduling

    custom_scheduling = params[:client][:custom_scheduling] == "on"

    if custom_scheduling
      periodicity = params[:client][:scheduling_periodicity].to_i
      amount = params[:client][:scheduling_amount_per_period]

      # quick way to check if given value is a valid number
      if amount.to_i.to_s != amount || amount == "0"
        amount = 1
      end
    else
      periodicity = Client.scheduling_periodicities[:scheduler_hourly]
      amount = 1
    end

    if @client.update(custom_scheduling: custom_scheduling, scheduling_periodicity: periodicity, scheduling_amount_per_period: amount)
      notice = "Client's Custom Scheduling was successfully saved."
    else
      notice = "Error saving client's custom scheduling."
    end

    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_client
    @client = policy_scope(Client).find_by_unix_user(params[:client_id])
    if !@client
      raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:client_id]}", Client.name, params[:client_id])
    end
  end
end