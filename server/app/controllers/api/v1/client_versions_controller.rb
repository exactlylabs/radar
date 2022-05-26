module Api
  module V1
    class ClientVersionsController < ApiController
      before_action :ensure_superuser

      def index
        @client_versions = ClientVersion.order('created_at DESC')
      end

      def show
        if params[:id] == 'stable'
          @client_version = ClientVersion.stable
        else
          @client_version = ClientVersion.find_by_version(params[:id])
        end
        
        if @client_version.nil?
          head 404
        end
      end
      
      def create
        @client_version = ClientVersion.find_by_version(create_params[:version])
        if @client_version
          render :show, status: 303
        else
          @client_version = ClientVersion.new create_params
          if @client_version.save
            render :show, status: :created
          else
            render_error_for @client_version
          end
        end
        
      end

      private

      def create_params
        params.permit(:version)
      end
    end
  end
end
