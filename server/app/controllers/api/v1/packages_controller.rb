module Api
  module V1
    class PackagesController < ApiController
      before_action :set_version!
      before_action :ensure_superaccount!
      
      def index
        if @version
          @packages = @version.packages
        end
      end

      def show
        @package = @version.packages.find_by_name(params[:id])
      end

      def create
        @package = Package.new package_params
        @package.client_version = @version
        if @package.save
          render :show, status: :created
        else
          render_error_for @package
        end
      end

      def update
        @package = @version.packages.find_by_name(params[:id])
        if @package.update package_params
          render :show, status: :ok
        else
          render_error_for @package
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

      def package_params
        params.require(:package).permit(:name, :file, :os)
      end

    end
  end
end
