class ClientCountLog < ApplicationRecord
  belongs_to :client_count_aggregate

  CLIENT_ADDED = "CLIENT_ADDED"
  CLIENT_REMOVED = "CLIENT_REMOVED"
  NEW_CLIENT_ONLINE = "NEW_CLIENT_ONLINE"
  NEW_CLIENT_OFFLINE = "NEW_CLIENT_OFFLINE"
  CLIENT_IN_SERVICE = "CLIENT_IN_SERVICE"
  CLIENT_NOT_IN_SERVICE = "CLIENT_NOT_IN_SERVICE"

  def self.new_client_event(agg, timestamp=nil)
    create_event agg, CLIENT_ADDED, timestamp=timestamp
  end

  def self.client_removed_event(agg, timestamp=nil)
    create_event agg, CLIENT_REMOVED, timestamp=timestamp
  end

  def self.client_online_event(agg, timestamp=nil)
    create_event agg, NEW_CLIENT_ONLINE, timestamp=timestamp
  end

  def self.client_offline_event(agg, timestamp=nil)
    create_event agg, NEW_CLIENT_OFFLINE, timestamp=timestamp
  end

  def self.client_in_service_event(agg, timestamp=nil)
    create_event agg, CLIENT_IN_SERVICE, timestamp=timestamp
  end

  def self.client_not_in_service_event(agg, timestamp=nil)
    create_event agg, CLIENT_NOT_IN_SERVICE, timestamp=timestamp
  end

  private

  def self.create_event(agg, cause, timestamp=nil)
      ClientCountLog.create(
        client_count_aggregate: agg,
        online: agg.online,
        total: agg.total,
        total_in_service: agg.total_in_service,
        update_cause: cause,
        timestamp: timestamp || Time.now
      )
    end
end
