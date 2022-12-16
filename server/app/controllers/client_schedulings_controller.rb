class ClientSchedulingsController < ApplicationController
    before_action :authenticate_user!, except: %i[ create ]
    before_action :set_client
    skip_forgery_protection only: %i[ create ]

  # GET /schedulings or /schedulings.json
  def index
    @schedulings = @client.schedulings
    respond_to do |format|
      format.html { render "index", locals: { schedulings: @schedulings } }
  end
end

  # POST /schedulings or /schedulings.json
  def create
    head(403)
    return
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

    def client_signed_in?
      test = Client.find_by_unix_user(params[:client_id])&.authenticate_secret(params[:client_secret])
      if !test
        raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:client_id]}", Client.name, params[:client_id])
      end
    end