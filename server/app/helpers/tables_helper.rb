module TablesHelper
  module TableTypes
    MEMBERS = "Members"
    LOCATIONS = "Locations"
    CLIENTS = "Clients"
  end

  def self.widths(table_type, is_all_accounts)
    case table_type
    when TableTypes::MEMBERS
      [
        '4%',
        is_all_accounts ? '31%' : '46%',
        is_all_accounts ? '15%' : '0%',
        '15%',
        '15%',
        '15%',
        '5%'
      ]
    when TableTypes::LOCATIONS
      []
    when TableTypes::CLIENTS
      []
    end
  end
end