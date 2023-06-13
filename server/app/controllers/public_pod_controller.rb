class PublicPodController < PublicApplicationController

  before_action :set_client, only: [:setup, :status, :update_public_page]

  def index
  end

  def find_pod
  end

  def check_id
    pod_id = params[:pod_id]
    possible_pod = Client.find_by_unix_user(pod_id)
    respond_to do |format|
      if !possible_pod
        format.json { render json: { msg: 'Client not found!' }, status: :not_found }
      elsif !possible_pod.claimed_by_id
        format.html { redirect_to "/setup/#{possible_pod.unix_user}" }
      else
        format.html { redirect_to "/check/#{possible_pod.unix_user}" }
      end
    end
  end

  def setup
    if @client.account.present?
      respond_to do |format|
        format.html { redirect_to "/check/#{@client.unix_user}" }
      end
    end
  end

  def status
    if @client.account.nil?
      respond_to do |format|
        format.html { redirect_to "/setup/#{@client.unix_user}" }
      end
    end
  end

  def update_public_page
    respond_to do |format|
      format.turbo_stream
    end
  end

  private
  def set_client
    @client = Client.find_by_unix_user(params[:pod_id])
    if !@client
      raise ActiveRecord::RecordNotFound.new("Couldn't find Pod with 'id'=#{params[:pod_id]}", Client.name, params[:pod_id])
    end
  end
end