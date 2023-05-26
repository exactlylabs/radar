module Api
  module V1
    class UpdateGroupsController < ApiController
      before_action :ensure_superaccount!

      def index
        @update_groups = UpdateGroup.order('created_at DESC')
      end

      def show
        @update_group = UpdateGroup.find(params[:id])
        if @update_group.nil?
          head 404
        end
      end

      def update
        @update_group = UpdateGroup.find(params[:id])
        if @update_group.update(update_params)
          render :show, status: :ok
        else
          render_error_for @update_group
        end
      end

      private

      def update_params
        params.permit(:client_version_id, :watchdog_version_id)
      end
    end
  end
end
