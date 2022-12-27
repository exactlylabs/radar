class ClientDataUsageController < ApplicationController
  before_action :authenticate_user!
  before_action :set_client

  # GET /data_cap
  def index
    respond_to do |format|
      format.html { render "index" }
    end
  end

  # GET data_cap/edit
  def edit
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

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_client
    if user_signed_in?
      @client = current_account.clients.find_by_unix_user(params[:client_id])
    else
      client = Client.find_by_unix_user(params[:client_id])
      if client.authenticate_secret(params[:client_secret])
        @client = client
      end
    end
    if !@client
      raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:client_id]}", Client.name, params[:client_id])
    end
  end
end