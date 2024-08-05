class PublicPodController < PublicApplicationController
  include ChartsHelper

  before_action :set_client, only: [:setup, :status, :update_public_page, :download_speeds, :upload_speeds, :latency, :data_usage]

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
      redirect_to "/check/#{@client.unix_user}"
      return
    end
  end

  def status
    if @client.account.nil?
      redirect_to "/setup/#{@client.unix_user}"
      return
    end
    render layout: "public_pod"
  end

  def update_public_page
    respond_to do |format|
      format.turbo_stream
    end
  end

  def download_speeds
    @responsive = params[:responsive] == "true"
    params = pod_download_speeds_params(@client)
    sql = DashboardHelper.get_pod_download_speed_sql(@client.id, params[:from], params[:to], @client.account.id)
    @download_speeds = ActiveRecord::Base.connection.execute(sql)
    render "dashboard/download_speeds"
  end

  def upload_speeds
    @responsive = params[:responsive] == "true"
    params = pod_upload_speeds_params(@client)
    sql = DashboardHelper.get_pod_upload_speed_sql(@client.id, params[:from], params[:to], @client.account.id)
    @upload_speeds = ActiveRecord::Base.connection.execute(sql)
    render "dashboard/upload_speeds"
  end

  def latency
    @responsive = params[:responsive] == "true"
    params = pod_latency_params(@client)
    sql = DashboardHelper.get_pod_latency_sql(@client.id, params[:from], params[:to], @client.account.id)
    @latencies = ActiveRecord::Base.connection.execute(sql)
    render "dashboard/latency"
  end

  def data_usage
    @responsive = params[:responsive] == "true"
    params = pod_data_usage_params(@client)
    sql = DashboardHelper.get_pod_usage_sql(@client.id, params[:from], params[:to], @client.account.id)
    @usage = ActiveRecord::Base.connection.execute(sql)
    render "dashboard/data_usage"
  end

  private
  def set_client
    @client = Client.find_by_unix_user(params[:pod_id] || params[:id])
    if !@client
      raise ActiveRecord::RecordNotFound.new("Couldn't find Pod with 'id'=#{params[:pod_id]}", Client.name, params[:pod_id])
    end
  end
end