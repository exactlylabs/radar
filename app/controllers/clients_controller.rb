require "sshkey"

class ClientsController < ApplicationController
  before_action :authenticate_user!, except: %i[ configuration new create ]
  before_action :authenticate_client!, only: %i[ configuration ]
  before_action :set_client, only: %i[ claim configuration release show edit update destroy ]
  skip_forgery_protection only: %i[ configuration new create ]

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

  def claim
    client_id = params[:id]
    client_secret = params[:secret]

    client = Client.where(unix_user: client_id).first

    respond_to do |format|
      if client && client.authenticate_secret(client_secret)
        client.user = current_user
        client.save
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
  end

  def configuration
    k = SSHKey.generate

    @client.public_key = k.public_key
    @private_key = k.private_key

    if @client.remote_gateway_port == nil
      @client.claim_remote_port
      @client.endpoint_host = ENV["ENDPOINT_HOST"]
      @client.endpoint_port = ENV["ENDPOINT_PORT"]
    end

    @client.save

    respond_to do |format|
      format.json { render :configuration, status: :ok }
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
        format.html { redirect_to client_path(@client.unix_user), notice: "Client was successfully created." }
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
        format.html { redirect_to client_path(@client.unix_user), notice: "Client was successfully updated." }
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
      params.require(:client).permit(:name, :address)
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
