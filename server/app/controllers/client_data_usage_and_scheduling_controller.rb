class ClientDataUsageAndSchedulingController < ApplicationController
  before_action :authenticate_user!
  before_action :check_account_presence, only: %i[ index ]
  before_action :set_client

  # GET /clients/:unix_user/data_usage_and_scheduling
  def index
    account_id = current_account.id == -1 ? nil : current_account.id
    @total_avg = @client.get_speed_averages(account_id)
  end

  # PUT clients/:unix_user/data_usage
  def edit_data_cap
    given_data_cap_unit = params[:user][:data_cap_unit]
    given_data_cap = params[:client][:data_cap_max_usage]
    # Quick way to check if given value is a valid number
    if given_data_cap.to_i.to_s != given_data_cap
      given_data_cap = nil
    end

    wants_to_have_data_cap = params[:client][:wants_to_have_data_cap] == "on"

    if given_data_cap.present? && wants_to_have_data_cap
      @client.data_cap_max_usage = get_value_in_bytes(given_data_cap.to_i, given_data_cap_unit.upcase).round(0) # save the value in B (frontend asks for MB)
      given_reset = params[:client][:data_cap_reset].to_i # 1 for first day, -1 for last, 2 for specific day
      if given_reset == -1
        @client.data_cap_day_of_month = -1
      else
        @client.data_cap_day_of_month = params[:client][:data_cap_day_of_month].to_i
      end
    else
      @client.data_cap_max_usage = nil
      @client.data_cap_day_of_month = 1
    end

    # Just in case something isn't set to monthly by this point
    if @client.data_cap_periodicity != Client.data_cap_periodicities[:monthly]
      @client.data_cap_periodicity = Client.data_cap_periodicities[:monthly]
    end

    if given_data_cap_unit.upcase != current_user.data_cap_unit
      current_user.data_cap_unit = given_data_cap_unit.upcase
      current_user.save!
    end

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

  def enable_custom_scheduling
    if @client.update(custom_scheduling: true)
      notice = 'Pod Custom Scheduling was successfully enabled.'
    else
      notice = 'Error enabling Custom Scheduling.'
    end
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: notice }
      format.json { head :no_content }
    end
  end

  def enable_data_cap
    if @client.update(data_cap_max_usage: 0, data_cap_periodicity: Client.data_cap_periodicities[:monthly])
      notice = 'Pod Data Cap was successfully enabled.'
    else
      notice = 'Error enabling Data Cap.'
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

  def get_value_in_bytes(value, unit)
    gb_multiplier = (1024**3)
    mb_multiplier = (1024**2)
    if (unit.present? && unit == "GB")
      value * gb_multiplier
    else
      value * mb_multiplier
    end
  end
end