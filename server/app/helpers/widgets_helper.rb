module WidgetsHelper
  module WidgetTypes
    LOCATIONS_MAP = 'locations_map'
    ONLINE_POD_COUNT = 'online_pod_count'
    DOWNLOAD_SPEED = 'download_speed'
    UPLOAD_SPEED = 'upload_speed'
    LATENCY = 'latency'
    DATA_USAGE = 'data_usage'
    TOTAL_DATA = 'total_data'
  end

  module WidgetHeaders
    LOCATIONS_MAP = 'All locations'
    ONLINE_POD_COUNT = 'Online pods'
    DOWNLOAD_SPEED = 'Download speed'
    UPLOAD_SPEED = 'Upload speed'
    LATENCY = 'Latency'
    DATA_USAGE = 'Data usage'
    TOTAL_DATA = 'Total data'
  end

  def self.get_header(type)
    case type
    when WidgetTypes::LOCATIONS_MAP
      WidgetHeaders::LOCATIONS_MAP
    when WidgetTypes::ONLINE_POD_COUNT
      WidgetHeaders::ONLINE_POD_COUNT
    when WidgetTypes::DOWNLOAD_SPEED
      WidgetHeaders::DOWNLOAD_SPEED
    when WidgetTypes::UPLOAD_SPEED
      WidgetHeaders::UPLOAD_SPEED
    when WidgetTypes::LATENCY
      WidgetHeaders::LATENCY
    when WidgetTypes::DATA_USAGE
      WidgetHeaders::DATA_USAGE
    when WidgetTypes::TOTAL_DATA
      WidgetHeaders::TOTAL_DATA
    else
      WidgetHeaders::LOCATIONS_MAP
    end
  end
end