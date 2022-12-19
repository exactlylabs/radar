
class ClientCountAggregate < ApplicationRecord
    belongs_to :aggregator, polymorphic: true
    has_many :client_count_logs
    has_one :consumer_offset, as: :consumer

    def new_client!(client, event)
        self.total += 1
        if client["online"]
            self.online +=1
        end
        ClientCountLog.create_event self, ClientCountLog::CLIENT_ADDED
        self.save!
    end

    def client_removed!(client, event)
        self.total -= 1
        if client["online"]
            self.online -= 1
        end
        ClientCountLog.create_event self, ClientCountLog::CLIENT_REMOVED
        self.save!
    end

    def client_online!(client, event)
        self.online += 1
        ClientCountLog.create_event self, ClientCountLog::NEW_CLIENT_ONLINE
        self.save!
    end

    def client_offline!(client, event)
        self.online -= 1
        ClientCountLog.create_event self, ClientCountLog::NEW_CLIENT_OFFLINE
        self.save!
    end

    def self.aggregate!
        # Consumes from the event stream from the last offset
        consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "ClientCountAggregate")
        events = ClientEventLog.where("client_event_logs.id > ?", consumer_offset.offset).order('client_event_logs.timestamp ASC')

        # Load current state of all aggregators here, so we are able to do the increment/decrements
        # Create if it doesn't exists yet
        aggregators = {
            "account" => {},
            "location" => {},
        }
        
        count_events = []
        events.each do |evt|
            client = evt.data["state"]
            account_id = client["account_id"]
            location_id = client["location_id"]

            if account_id && aggregators["account"][account_id].nil?
                account = Account.find(account_id)
                aggregators["account"][account_id] = ClientCountAggregate.find_or_create_by(aggregator: account)
            end
            accountAggregate = aggregators["account"][account_id] if account_id
            

            if location_id && aggregators["location"][location_id].nil?
                location = Location.find(location_id)
                aggregators["location"][location_id] = ClientCountAggregate.find_or_create_by(aggregator: location)
            end
            locationAggregate = aggregators["location"][location_id] if account_id

            Client.transaction do
                case evt.name
                when ClientEventLog::CREATED
                    # Increase the count of both the account and location aggregators
                    accountAggregate.new_client! client, evt if accountAggregate
                    locationAggregate.new_client! client, evt if locationAggregate
                    
                when ClientEventLog::WENT_ONLINE
                    # Increase the online count for both the account and location aggregators
                    accountAggregate.client_online! client, evt if accountAggregate
                    locationAggregate.client_online! client, evt if locationAggregate

                when ClientEventLog::WENT_OFFLINE
                    # Decrease the online count for both the account and location aggregators
                    accountAggregate.client_offline! client, evt if accountAggregate
                    locationAggregate.client_offline! client, evt if locationAggregate

                when ClientEventLog::LOCATION_CHANGED
                    # Increase the online count for the new location
                    # Decrease the online count for the old location
                    from = evt.data["event_data"]["from"]
                    if from && aggregators["location"][from].nil?
                        location = Location.find(from)
                        aggregators["location"][from] = ClientCountAggregate.find_or_create_by(aggregator: location)
                    end
                    oldAggregate = aggregators["location"][from] if from

                    locationAggregate.new_client! client, evt if locationAggregate
                    oldAggregate.client_removed! client, evt if oldAggregate

                when ClientEventLog::ACCOUNT_CHANGED
                    # Increase the online count for the new account
                    # Decrease the online count for the old account
                    from = evt.data["event_data"]["from"]
                    if from && aggregators["account"][from].nil?
                        account = Account.find(from)
                        aggregators["account"][from] = ClientCountAggregate.find_or_create_by(aggregator: account)
                    end
                    oldAggregate = aggregators["account"][from] if from

                    accountAggregate.new_client! client, evt if accountAggregate
                    oldAggregate.client_removed! client, evt if oldAggregate
                end

                consumer_offset.offset = evt.id
                consumer_offset.save!
            end
        end
    end
end