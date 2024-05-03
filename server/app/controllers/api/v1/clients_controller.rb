module Api
  module V1
    class ClientsController < ApiController
      skip_before_action :check_basic_auth
      before_action :authenticate_client, except: [:create]

      # GET /api/v1/clients/me return the ClientToken's owner information
      def me
        return :unauthorized unless @client.present?

        render json: @client.as_json.except("secret_digest"), status: :ok
      end

      # POST /api/v1/clients
      def create
        @client = Client.new(create_client_params)
        @client.user = current_user
        @secret = SecretsHelper.create_human_readable_secret(11)
        @client.secret = @secret
        ug = UpdateGroup.default_group
        if !ug.nil?
          @client.update_group = ug
        end

        # If it's registered with a superaccount token
        # set the pod as having a watchdog (physical pod)
        if params[:registration_token] && Account.find_by_token(params[:registration_token])&.superaccount?
          @client.has_watchdog = true
        end

        if @client.save
          render json: @client.as_json.except("secret_digest").merge("secret" => @secret), status: :created
        else
          render_error_for @client
        end
      end

      # POST /api/v1/clients/assign
      def assign
        user_account = UsersAccount.find_by_token(params[:token])
        unless user_account.present?
          render json: { error: "Invalid User Account Token" }, status: :bad_request
        end

        @client.account = user_account.account
        @client.user = user_account.user

        if network_params.present? && network_params[:id].nil?
          @client.location = create_network_for_client(@client)

        elsif network_params.present?
          location = policy_scope(Location).find(network_params[:id])
          @client.update!(location: location)
        end

        if @client.save
          render json: @client.as_json.except("secret_digest"), status: :ok
        else
          render_error_for @client
        end
      end

      private

      def create_network_for_client(client)
        Location.create!(network_params.merge(account: client.account, created_by_id: client.user.id))
      end

      def network_params
        params.permit(:network => [:id, :name, :latitude, :longitude, :address, :expected_mbps_down, :expected_mbps_up])
      end

      def create_client_params
        params.permit(:name, :register_label)
      end
    end
  end
end
