class StagingClientsController < ApplicationController
    def index
        if !current_user.superuser
            head(403)
        end
        @clients = Client.where(staging: true)
    end

    # POST /staging-clients/id/publish
    # Unset the staging flag
    def publish
        if !current_user.superuser
            head(403)
        end
        @client = Client.find_by_unix_user(params[:id])
        @client.staging = false
        @client.raw_secret = nil
        @client.save
        redirect_to request.env['HTTP_REFERER'], notice: "Client Published."
    end

end
