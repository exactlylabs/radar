module WidgetsHelper
  module WidgetTypes
    LOCATIONS_MAP = 'locations_map'
    ONLINE_POD_COUNT = 'online_pod_count'
    COMPARISON_ONLINE_POD_COUNT = 'comparison_online_pod_count'
    DOWNLOAD_SPEED = 'download_speed'
    COMPARISON_DOWNLOAD_SPEED = 'comparison_download_speed'
    UPLOAD_SPEED = 'upload_speed'
    COMPARISON_UPLOAD_SPEED = 'comparison_upload_speed'
    LATENCY = 'latency'
    COMPARISON_LATENCY = 'comparison_latency'
    DATA_USAGE = 'data_usage'
    COMPARISON_DATA_USAGE = 'comparison_data_usage'
    OUTAGES = 'outages'
    TOTAL_DATA = 'total_data'
    COMPARISON_TOTAL_DATA = 'comparison_total_data'
  end

  WidgetHeaders = {
    locations_map: 'All locations',
    online_pod_count: 'Online pods',
    comparison_online_pod_count: 'Online pods',
    download_speed: 'Download speed',
    comparison_download_speed: 'Download speed',
    upload_speed: 'Upload speed',
    comparison_upload_speed: 'Upload speed',
    latency: 'Latency',
    comparison_latency: 'Latency',
    data_usage: 'Data usage',
    comparison_data_usage: 'Data usage',
    outages: 'Outages',
    total_data: 'Total data',
    comparison_total_data: 'Total data'
  }

  def self.get_header(type)
    WidgetHeaders[type.to_sym]
  end
end