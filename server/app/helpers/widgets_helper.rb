module WidgetsHelper
  module WidgetTypes
    LOCATIONS_MAP = 'locations_map'
  end

  module WidgetHeaders
    LOCATIONS_MAP = 'All locations'
  end

  def self.get_header(type)
    case type
    when WidgetTypes::LOCATIONS_MAP
      WidgetHeaders::LOCATIONS_MAP
    else
      WidgetHeaders::LOCATIONS_MAP
    end
  end
end