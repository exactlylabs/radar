module Api
  module V1
    class ClientVersionsController < ApiController
      before_action :is_superuser

      def index
        @client_versions = ClientVersion.order('created_at DESC')
      end

      def show
        @client_version = ClientVersion.find(params[:id])
      end
      
      def create
        @client_version = ClientVersion.new create_params
        if @client_version.save
          render :show, status: :created
        else
          render_error_for client_version
        end
      end

      private

      def create_params
        params.require(:client_version).permit(:version)
      end
    end
  end
end
