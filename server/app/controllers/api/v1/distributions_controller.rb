module Api
  module V1
    class DistributionsController < ApiController
      before_action :set_version!
      before_action :ensure_superuser
      
      def index
        if @version
          @distributions = @version.distributions
        end
      end

      def show
        @distribution = Distribution.find(params[:id])
      end

      def create
        @distribution = Distribution.new distribution_params
        @distribution.client_version = @version
        if @distribution.save
          render :show, status: :created
        else
          render_error_for @distribution
        end
      end

      def update
        @distribution = Distribution.find(params[:id])
        if @distribution.update distribution_params
          render :show, status: :ok
        else
          render_error_for @distribution
        end
      end

      private
  
      def set_version!
        if params[:client_version_id] == "stable"
          @version = ClientVersion.stable
        else
          @version = ClientVersion.find_by_version(params[:client_version_id])
        end
      end

      def distribution_params
        params.require(:distribution).permit(:name, :binary, :signed_binary)
      end

    end
  end
end
