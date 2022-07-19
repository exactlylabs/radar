require "sshkey"

class ClientsController < ApplicationController
  before_action :authenticate_user!, except: %i[ configuration new create status public_status check_public_status run_test ]
  before_action :authenticate_client!, only: %i[ configuration status ], if: :json_request?
  before_action :set_client, only: %i[ release show edit update destroy ]
  before_action :authenticate_token!, only: %i[ create ]
  skip_forgery_protection only: %i[ status configuration new create ]

  # GET /clients or /clients.json
  def index
    @status = params[:status]
    @location = params[:location]
    @all_locations = policy_scope(Location).where_has_client_associated
    # New designs index clients by location
    get_indexed_clients
  end

  # GET /clients/1 or /clients/1.json
  def show
  end

  # GET /clients/new
  def new
    @client = Client.new
  end

  # GET /clients/1/edit
  def edit
  end

  def claim_form
    @client = Client.new
    @location_id = params[:location_id] || nil
  end

  def run_test
    # Allow without a logged in user to request a test if id / secret is known
    client_id = params[:id]
    @secret = params[:secret]
    @client = Client.find_by_unix_user(client_id)&.authenticate_secret(@secret)

    # If no secret, then we need to authenticate
    if !@client
      authenticate_user!
      @client = policy_scope(Client).find_by_unix_user(params[:id])
    end

    respond_to do |format|
      if @client.update(test_requested: true)
        format.html { redirect_to request.env['HTTP_REFERER'], notice: "Client test requested." }
        format.json { render :show, status: :ok, location: clients_path(@client.unix_user) }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @client.errors, status: :unprocessable_entity }
      end
    end
  end

  def check_claim
    @client_id = params[:id]
    @client_secret = params[:secret]
    @client = Client.where(unix_user: @client_id).first
    respond_to do |format|
      if @client && @client.authenticate_secret(@client_secret)
        @client.user = current_user
        format.json { render status: :ok, json: @client.to_json }
      else
        @error = true
        format.json { render json: {}, status: :unprocessable_entity }
      end
    end
  end

  def claim
    @client_id = params[:id]
    @client_secret = params[:secret]
    @location_id = params[:location_id]
    @client_name = params[:name]

    location = policy_scope(Location).where(id: @location_id).first if @location_id.present?
    @client = Client.where(unix_user: @client_id).first

    respond_to do |format|
      if @client && @client.authenticate_secret(@client_secret)
        @client.user = current_user
        @client.location = location
        @client.name = @client_name
        @client.save
        format.html { redirect_back fallback_location: root_path, notice: "Client was successfully created." }
        format.json { render :show, status: :ok, location: client_path(@client.unix_user) }
      else
        @error = true
        format.html { render :claim_form, status: :unprocessable_entity }
        format.json { render json: {}, status: :unprocessable_entity }
      end
    end
  end

  def release
    respond_to do |format|
      if @client.update(user: nil, location: nil)
        format.html { redirect_back fallback_location: root_path, notice: "Client was successfully released." }
        format.json { head :no_content }
      end
    end
  end

  def configuration
    k = SSHKey.generate

    @client.public_key = k.ssh_public_key
    @private_key = k.private_key

    if @client.remote_gateway_port == nil
      # New client
      @client.claim_remote_port
      @client.endpoint_host = ENV["ENDPOINT_HOST"]
      @client.endpoint_port = ENV["ENDPOINT_PORT"]

      FileUtils.mkdir_p("/etc/ssh/sshd_config.d/")
      File.open("/etc/ssh/sshd_config.d/radar-#{@client.unix_user}.conf","w") do |f|
        f.write <<-EOF
Match User #{@client.unix_user}
AllowTcpForwarding remote
AllowStreamLocalForwarding no
X11Forwarding no
AllowAgentForwarding no
ForceCommand /bin/false
GatewayPorts yes
PermitListen #{@client.remote_gateway_port}
EOF
      end
      cmd = "adduser --disabled-password --gecos \"\" #{@client.unix_user}"
      system(cmd)
      system("systemctl reload sshd") if Rails.env.production?
    end

    if @client.remote_gateway_port == 33001
      # TODO: remove this once all clients have been updated
      @client.claim_remote_port
    end

    FileUtils.mkdir_p("/home/#{@client.unix_user}/.ssh")
    File.open("/home/#{@client.unix_user}/.ssh/authorized_keys","w") do |f|
      f.write(k.ssh_public_key)
    end
    FileUtils.chown @client.unix_user, @client.unix_user, "/home/#{@client.unix_user}/.ssh"
    FileUtils.chown @client.unix_user, @client.unix_user, "/home/#{@client.unix_user}/.ssh/authorized_keys"

    # Write private key

    @client.save

    respond_to do |format|
      format.json { render :configuration, status: :ok }
    end
  end

  def public_status
  end

  def check_public_status
    client_id = params["id"]
    @secret = params["secret"]

    @client = Client.find_by_unix_user(client_id)&.authenticate_secret(@secret)
  end

  def status
    @client.pinged_at = Time.now
    @client.raw_version = params[:version]
    @client.distribution_name = params[:distribution]
    if params[:network_interfaces]
      @client.network_interfaces = JSON.parse(params[:network_interfaces])
    end
    
    if !params[:version].nil?
      # Check client Version
      version = ClientVersion.where version: params[:version]
      if version.length == 0
        # No version found
        version = nil
      else
        version = version[0]
      end
      @client.client_version = version
    end
    @client.save

    respond_to do |format|
      format.json { render :status, status: :ok }
    end
  end

  # POST /clients or /clients.json
  def create
    @client = Client.new
    @client.user = current_user

    o = [('a'..'z'), ('A'..'Z'), (0..9)].map(&:to_a).flatten - [0, 1, "o", "l", "I", "O"]
    @secret = (0...11).map { o[rand(o.length)] }.join
    @client.secret = @secret
    ug = UpdateGroup.default_group
    if !ug.nil?
      @client.update_group = ug
    end

    # If it's registered with a superuser token
    # set the pod as a staging pod
    if @user && @user.superuser?
      @client.staging = true
        @client.raw_secret = @secret

        # TODO: For future releases, it's interesting
      # if we could auto-claim the pod if it's already authenticated.
    end

    respond_to do |format|
      if @client.save
        clients = policy_scope(Client)
        format.turbo_stream {
          render turbo_stream: turbo.stream.replace('clients_container_dynamic', partial: 'clients_list', locals: {clients: clients})
        }
        format.html { redirect_to clients_path, notice: "Client was successfully created." }
        format.json { render :show, status: :created, location: client_path(@client.unix_user) }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @client.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /clients/1 or /clients/1.json
  def update
    location = policy_scope(Location).find(params[:location_id]) if params[:location_id]
    client = params[:client]
    respond_to do |format|
      if @client.update(name: client[:name], location: location)
        format.html { redirect_back fallback_location: root_path, notice: "Client was successfully updated." }
        format.json { render :show, status: :ok, location: client_path(@client.unix_user) }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @client.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /clients/1 or /clients/1.json
  def destroy
    @client.destroy
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: "Client was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_client
      @client = policy_scope(Client).find_by_unix_user(params[:id])
      if !@client
        raise ActiveRecord::RecordNotFound.new("Couldn't find Client with 'id'=#{params[:id]}", Client.name, params[:id])
      end
    end

    # Only allow a list of trusted parameters through.
    def client_params
      params.require(:client).permit(:name, :address, :location_id)
    end

    def authenticate_client!
      client_id = params[:id]
      client_secret = params[:secret]
      @client = Client.find_by_unix_user(client_id)&.authenticate_secret(client_secret)
      if !@client
        head(403)
      end
    end

    def authenticate_token!
      if !request.headers["Authorization"].nil?
        token = request.headers["Authorization"].split(" ")
        if token.size == 2
          @user = User.where({"token": token[1]}).first
        end
      end
    end
    
    def json_request?
      request.format.symbol == :json
    end

    def get_indexed_clients
      # Is there a better way to override the scope method for using
      # account instead of user??
      @clients = policy_scope(Client)
      if @location.present?
        @clients = @clients.where(location: @location) if @location.to_i != -1
        @clients = @clients.where_no_location if @location.to_i == -1
      end
      @clients = @clients.where_online if @status == "online"
      @clients = @clients.where_offline if @status == "offline"
      @indexed_clients = {}
      @clients.each do |client|
        if client.location
          @indexed_clients[client.location] = [] if @indexed_clients[client.location].nil?
          @indexed_clients[client.location].append(client)
        else
          @clients_with_no_location = [] if @clients_with_no_location.nil?
          @clients_with_no_location.append(client)
        end
      end
    end
end
