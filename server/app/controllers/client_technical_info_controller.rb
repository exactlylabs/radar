class ClientTechnicalInfoController < ApplicationController
  before_action :authenticate_user!
  before_action :check_account_presence, only: %i[ index ]
  before_action :set_client

  def index

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
