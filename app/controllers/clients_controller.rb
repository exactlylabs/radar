require "sshkey"

class ClientsController < ApplicationController
  before_action :authenticate_user!, except: %i[ configuration new create status public_status check_public_status run_test ]
  before_action :authenticate_client!, only: %i[ configuration status ]
  before_action :set_client, only: %i[ claim release show edit update destroy ]
  skip_forgery_protection only: %i[ status configuration new create ]

  # GET /clients or /clients.json
  def index
    #@clients = Client.where(user: current_user)
    @clients = policy_scope(Client)
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

  def claim
    client_id = params[:id]
    client_secret = params[:secret]
    location_id = params[:location_id]

    client = Client.where(unix_user: client_id).first

    respond_to do |format|
      if client && client.authenticate_secret(client_secret)
        client.user = current_user
        client.location_id = location_id
        client.save
        format.turbo_stream { render turbo_stream: turbo_stream.append('clients', partial: 'clients/client', locals: {client: client}) }
        format.html { redirect_to client_path(client.unix_user), notice: "Client was successfully claimed." }
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
      if @client.update(user: nil)
        format.turbo_stream { render turbo_stream: turbo_stream.remove(@client) }
        format.html { redirect_to clients_path, notice: "Client was successfully released." }
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
    @client.save

    respond_to do |format|
      format.json { render :status, status: :ok }
    end
  end

  # POST /clients or /clients.json
  def create
    @client = Client.new
    @client.user = current_user

    o = [('a'..'z'), ('A'..'Z'), (0..9)].map(&:to_a).flatten
    @secret = (0...11).map { o[rand(o.length)] }.join
    @client.secret = @secret

    respond_to do |format|
      if @client.save
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
    respond_to do |format|
      if @client.update(client_params)
        format.turbo_stream
        format.html { redirect_to clients_path, notice: "Client was successfully updated." }
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
      format.html { redirect_to clients_url, notice: "Client was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_client
      @client = policy_scope(Client).find_by_unix_user(params[:id])
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
end
