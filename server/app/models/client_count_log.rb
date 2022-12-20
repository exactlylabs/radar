class ClientCountLog < ApplicationRecord
  belongs_to :client_count_aggregate

  CLIENT_ADDED = "CLIENT_ADDED"
  CLIENT_REMOVED = "CLIENT_REMOVED"
  NEW_CLIENT_ONLINE = "NEW_CLIENT_ONLINE"
  NEW_CLIENT_OFFLINE = "NEW_CLIENT_OFFLINE"

  def self.new_client_event(agg)
    create_event agg, CLIENT_ADDED
  end

  def self.client_removed_event(agg)
    create_event agg, CLIENT_REMOVED
  end

  def self.client_online_event(agg)
    create_event agg, NEW_CLIENT_ONLINE
  end

  def self.client_offline_event(agg)
    create_event agg, NEW_CLIENT_OFFLINE    
  end

  private

  def self.create_event(agg, cause, timestamp=nil)
      ClientCountLog.create(
        client_count_aggregate: agg,
        online: agg.online,
        total: agg.total,
        update_cause: cause,
        timestamp: timestamp || Time.now
      )
    end
end
