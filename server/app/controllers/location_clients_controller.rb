class LocationClientsController < ApplicationController
    before_action :authenticate_user!
    before_action :set_location

    # GET /clients
    def index
        @clients = @location.clients

        respond_to do |format|
            format.html
            format.csv { send_data @clients.to_csv, filename: "clients-#{@location.id}.csv" }
        end
    end

    private
    def set_location
      @location = current_user.locations.find(params[:location_id])
    end
end