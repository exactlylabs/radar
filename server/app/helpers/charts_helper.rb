module ChartsHelper

  THREE_YEARS = 94_608_000
  ONE_YEAR = 31_536_000
  ONE_WEEK = 604_800
  ONE_DAY = 86_400
  TEN_MINUTES = 600
  COLORS = %w[#472118 #960A8B #FC3A11 #58396A #D6463E #307B2A #535FB6 #77DFB1 #767698 #502628 #EFE7DF #A502EF #B21BE4 #88FC76 #9FADE3 #B403C4 #78BCFE #686514 #B2D343 #CE87CA #20E92E #C8A3D7 #161C6C #98AE22 #A8A5CF #D72876 #105F87 #432B82 #5462EA #86C625 #9175BF #438F36 #AF3BCF #F3ADEF #050044 #5F47D3 #E11986 #0C7566 #A129E0 #43B2D6 #A7CB09 #0C7318 #9A6E4F #81B2A6 #AE37B2 #D66E62 #05F0D9 #EC1FA4 #4CAC54 #F94C42]

  REGULAR_CHARTS_LINE_OPTIONS = [
    { label: 'Minimum', hex: '#FF695D' },
    { label: 'Median', hex: '#4B7BE5' },
    { label: 'Maximum', hex: '#9138E5' }
  ]

  def self.format_axis_date(date, timeframe)
    if timeframe >= THREE_YEARS
      date.strftime('%Y')
    elsif timeframe >= ONE_YEAR
      date.strftime('%b %Y')
    elsif timeframe >= ONE_WEEK
      date.strftime('%b %d')
    elsif timeframe >= ONE_DAY
      date.strftime('%b %d %I:%M %p')
    elsif timeframe >= TEN_MINUTES
      date.strftime('%I:%M %p')
    else
      date.strftime('%I:%M:%S %p')
    end
  end

  def as_orgs_filters_params(current_account)
    common_filter_params(current_account).merge(time_filter_params)
  end

  def online_pods_params(current_account)
    params = common_filter_params(current_account).merge(time_filter_params)
    params.merge(interval_type: get_interval_type(params[:from], params[:to]) || 'd')
  end

  def download_speeds_params(current_account)
    params = common_filter_params(current_account).merge(time_filter_params)
    params.merge(interval_type: get_interval_type(params[:from], params[:to]) || 'd')
  end

  def compare_download_speeds_params(current_account)
    p = common_comparison_filter_params(current_account).merge(time_filter_params).merge(compare_by: params[:compare_by] || 'account', curve_type: params[:curve_type] || 'median')
    p.merge(interval_type: get_interval_type(p[:from], p[:to]) || 'd')
  end

  def upload_speeds_params(current_account)
    params = common_filter_params(current_account).merge(time_filter_params)
    params.merge(interval_type: get_interval_type(params[:from], params[:to]) || 'd')
  end

  def compare_upload_speeds_params(current_account)
    p = common_comparison_filter_params(current_account).merge(time_filter_params).merge(compare_by: params[:compare_by] || 'account', curve_type: params[:curve_type] || 'median')
    p.merge(interval_type: get_interval_type(p[:from], p[:to]) || 'd')
  end

  def latency_params(current_account)
    params = common_filter_params(current_account).merge(time_filter_params)
    params.merge(interval_type: get_interval_type(params[:from], params[:to]) || 'd')
  end

  def compare_latency_params(current_account)
    p = common_comparison_filter_params(current_account).merge(time_filter_params).merge(compare_by: params[:compare_by] || 'account', curve_type: params[:curve_type] || 'median')
    p.merge(interval_type: get_interval_type(p[:from], p[:to]) || 'd')
  end

  def data_usage_params(current_account)
    params = common_filter_params(current_account).merge(time_filter_params)
    params.merge(interval_type: get_interval_type(params[:from], params[:to]) || 'd')
  end

  def compare_data_usage_params(current_account)
    p = common_comparison_filter_params(current_account).merge(time_filter_params).merge(compare_by: params[:compare_by] || 'account', curve_type: params[:curve_type] || 'median')
    p.merge(interval_type: get_interval_type(p[:from], p[:to]) || 'd')
  end

  def total_data_params(current_account)
    params = common_filter_params(current_account).merge(time_filter_params)
    params.merge(interval_type: get_interval_type(params[:from], params[:to]) || 'd')
  end

  def compare_total_data_params(current_account)
    p = common_comparison_filter_params(current_account).merge(time_filter_params).merge(compare_by: params[:compare_by] || 'account', curve_type: params[:curve_type] || 'median')
    p.merge(interval_type: get_interval_type(p[:from], p[:to]) || 'd')
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
    days = params[:days] || 1
    start_time = params[:start].present? ? Time.at(params[:start].to_i / 1000) : (Time.now - days.to_i.days)
    end_time = params[:end].present? ? Time.at(params[:end].to_i / 1000) : Time.now
    { from: start_time.strftime('%Y-%m-%d %H:%M:%S').to_time, to: end_time.strftime('%Y-%m-%d %H:%M:%S').to_time }
  end

  def outages_params(current_account)
    common_filter_params(current_account).merge(time_filter_params).merge(outage_type: NetworkOutage.outage_types[params[:outage_type]], page: params[:page] || 0, page_size: params[:page_size] || 10)
  end

  def common_filter_params(current_account)
    if current_account.nil?
      account_ids = []
    elsif params[:account_id].present? && params[:account_id] != '-1'
      account_ids = policy_filter_ids(Account, params[:account_id])
      account_ids = [] if account_ids.blank?
    elsif current_account.is_all_accounts?
      account_ids = policy_scope(Account).pluck(:id)
    else
      account_ids = [current_account.id]
    end
    as_org_ids = params[:isp_id].present? ? policy_filter_ids(AutonomousSystemOrg, params[:isp_id]) : nil
    location_ids = params[:network_id].present? ? policy_filter_ids(Location, params[:network_id]) : nil
    { account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids }
  end

  def common_comparison_filter_params(current_account)
    if current_account.nil?
      account_ids = []
    elsif params[:account_id].present?
      account_ids = policy_filter_ids(Account, params[:account_id])
    elsif current_account.is_all_accounts?
      account_ids = policy_scope(Account).pluck(:id)
    else
      account_ids = [current_account.id]
    end

    filtered_params = get_params_from_compare_by
    { account_ids: account_ids, as_org_ids: filtered_params[:as_org_ids], location_ids: filtered_params[:location_ids], pod_ids: filtered_params[:pod_ids], category_names: filtered_params[:category_names] }
  end

  def get_params_from_compare_by
    params_to_use = {
      as_orgs_ids: nil,
      location_ids: nil,
      pod_ids: nil,
      category_names: nil
    }
    case params[:compare_by]
    when 'isp'
      params_to_use[:as_orgs_ids] = params[:isp_id].present? ? policy_filter_ids(AutonomousSystemOrg, params[:isp_id]) : policy_scope(AutonomousSystemOrg).pluck(:id)
    when 'network'
      params_to_use[:location_ids] = params[:network_id].present? ? policy_filter_ids(Location, params[:network_id]) : policy_scope(Location).pluck(:id)
    when 'pod'
      params_to_use[:pod_ids] = params[:pod_id].present? ? policy_filter_ids(Client, params[:pod_id]) : policy_scope(Client).pluck(:id)
    when 'category'
      # Categories in comparison dashboard are now meant to be "grouped" by name, so the filtering is also based on the name.
      # In order to filter by a given list of name we use the regex operator ~ to match the name with the list of names.
      # The list of names is built by joining the names with the | operator. So something like 'name ~ 'name1|name2|name3' will match any of the names in the list.
      params_to_use[:category_names] = params[:category_name].present? ?
                                       policy_scope(Category).where("name ~ ?", params[:category_name].join('|')).distinct.pluck(:name) :
                                       policy_scope(Category).group(:name).pluck(:name)
    end
    params_to_use
  end

  def common_pod_filter_params(pod)
    account_ids = pod.account.nil? ? [] : [pod.account.id]
    locations_ids = pod.location.nil? ? nil : [pod.location.id]
    { account_ids: account_ids, location_ids: locations_ids, as_org_ids: nil }
  end

  def policy_filter_ids(model, ids, sym_to_pluck = :id)
    policy_scope(model).where(id: ids).pluck(sym_to_pluck.to_sym)
  end

  def get_interval_type(from, to)
    return 'day' if from.nil? || to.nil?

    date_diff = to.to_i - from.to_i
    return 'second' if date_diff < 1.day
    return 'minute' if date_diff < 1.week
    return 'day' if date_diff < 1.year
  end
end