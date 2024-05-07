module ChartsHelper
  def as_orgs_filters_params(current_account)
    common_filter_params(current_account).merge(time_filter_params)
  end

  def online_pods_params(current_account)
    common_filter_params(current_account).merge(time_filter_params).merge(interval_type: 'd')
  end

  def download_speeds_params(current_account)
    common_filter_params(current_account).merge(time_filter_params)
  end

  def upload_speeds_params(current_account)
    common_filter_params(current_account).merge(time_filter_params)
  end

  def latency_params(current_account)
    common_filter_params(current_account).merge(time_filter_params)
  end

  def data_usage_params(current_account)
    common_filter_params(current_account).merge(time_filter_params).merge(interval_type: 'd')
  end

  def total_data_params(current_account)
    common_filter_params(current_account).merge(time_filter_params)
  end

  def pod_download_speeds_params(pod)
    common_pod_filter_params(pod).merge(time_filter_params)
  end

  def pod_upload_speeds_params(pod)
    common_pod_filter_params(pod).merge(time_filter_params)
  end

  def pod_latency_params(pod)
    common_pod_filter_params(pod).merge(time_filter_params)
  end

  def pod_data_usage_params(pod)
    common_pod_filter_params(pod).merge(time_filter_params).merge(interval_type: 'd')
  end

  def time_filter_params
    days = params[:days] || 30
    start_time = params[:start].present? ? Time.at(params[:start].to_i / 1000) : (Time.now - days.to_i.days)
    end_time = params[:end].present? ? Time.at(params[:end].to_i / 1000) : Time.now
    { from: start_time, to: end_time }
  end

  def outages_params(current_account)
    common_filter_params(current_account).merge(time_filter_params).merge(outage_type: OutageEvent.outage_types[params[:outage_type]])
  end

  def common_filter_params(current_account)
    if current_account.nil?
      account_ids = []
    elsif params[:account_id].present? && params[:account_id] != '-1'
      account_ids = policy_filter_ids(Account, params[:account_id])
    elsif current_account.is_all_accounts?
      account_ids = policy_scope(Account).pluck(:id)
    else
      account_ids = [current_account.id]
    end
    as_org_ids = params[:isp_id].present? ? policy_filter_ids(AutonomousSystemOrg, params[:isp_id]) : nil
    location_ids = params[:network_id].present? ? policy_filter_ids(Location, params[:network_id]) : nil
    { account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids }
  end

  def common_pod_filter_params(pod)
    account_ids = pod.account.nil? ? [] : [pod.account.id]
    locations_ids = pod.location.nil? ? nil : [pod.location.id]
    { account_ids: account_ids, location_ids: locations_ids, as_org_ids: nil }
  end
end