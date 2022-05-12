class ClientVersionsController < ApplicationController
    before_action :set_version!, only: %i[ show ]
    # GET /client-versions/id
    def show
    end

    private

    def set_version!
        if params[:id] == "stable"
            @version = ClientVersion.stable
        else
            @version = ClientVersion.find(params[:id])
        end
    end
end
