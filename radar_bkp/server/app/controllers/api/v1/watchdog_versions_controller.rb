module Api
    module V1
      class WatchdogVersionsController < ApiController
        before_action :ensure_superaccount!
  
        def index
          @watchdog_versions = WatchdogVersion.order('created_at DESC')
        end
  
        def show
          if params[:id] == 'stable'
            @watchdog_version = WatchdogVersion.stable
          else
            @watchdog_version = WatchdogVersion.find_by_version(params[:id])
          end
          
          if @watchdog_version.nil?
            head 404
          end
        end
        
        def create
          @watchdog_version = WatchdogVersion.find_by_version(create_params[:version])
          if @watchdog_version
            render :show, status: 303
          else
            @watchdog_version = WatchdogVersion.new create_params
            if @watchdog_version.save
              render :show, status: :created
            else
              render_error_for @watchdog_version
            end
          end
          
        end
  
        private
  
        def create_params
          params.permit(:version, :binary, :signed_binary)
        end
      end
    end
  end
  