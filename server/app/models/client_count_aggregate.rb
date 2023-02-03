
class ClientCountAggregate < ApplicationRecord
    belongs_to :aggregator, polymorphic: true
    has_many :client_count_logs
    has_one :consumer_offset, as: :consumer

    def new_client!(client, event)
        self.total += 1
        if client["online"]
            self.online +=1
        end
        if client["in_service"]
            self.total_in_service += 1
        end
        ClientCountLog.new_client_event self, event.timestamp
        self.save!
    end

    def client_removed!(client, event)
        self.total -= 1
        if client["online"]
            self.online -= 1
        end
        if client["in_service"]
            self.total_in_service -= 1
        end
        ClientCountLog.client_removed_event self, event.timestamp
        self.save!
    end

    def client_online!(client, event)
        self.online += 1
        ClientCountLog.client_online_event self, event.timestamp
        self.save!
    end

    def client_offline!(client, event)
        self.online -= 1
        ClientCountLog.client_offline_event self, event.timestamp
        self.save!
    end

    def client_in_service!(client, event)
        self.total_in_service += 1
        ClientCountLog.client_in_service_event self, event.timestamp
        self.save!
    end

    def client_not_in_service!(client, event)
        self.total_in_service -= 1
        ClientCountLog.client_not_in_service_event self, event.timestamp
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
            "as_org" => {},
        }

        count_events = []
        events.each do |evt|
            client = evt.data["state"]
            account_id = client["account_id"]
            location_id = client["location_id"]
            as_id = client["autonomous_system_id"]

            aggregates = [
                get_aggregate(account_id, aggregators["account"], model=Account),
                get_aggregate(location_id, aggregators["location"], model=Location),
                get_aggregate(as_id, aggregators["as_org"]) do |id|
                    AutonomousSystemOrg.joins(:autonomous_systems).find_by("autonomous_systems.id = ?", id)
                end
            ]

            Client.transaction do
                case evt.name
                when ClientEventLog::CREATED
                    # Increase the count of all aggregates
                    aggregates.map{|agg| agg.new_client! client, evt if agg}
                    
                when ClientEventLog::WENT_ONLINE
                    # Increase the online count for all aggregates
                    aggregates.map{|agg| agg.client_online! client, evt if agg}

                when ClientEventLog::WENT_OFFLINE
                    # Decrease the online count for all aggregates
                    aggregates.map{|agg| agg.client_offline! client, evt if agg}

                when ClientEventLog::LOCATION_CHANGED
                    # Increase the online count for the new location
                    # Decrease the online count for the old location
                    from = evt.data["event_data"]["from"]
                    to = evt.data["event_data"]["to"]
                    update_aggregator_change! client, evt, from, to, aggregators["location"], model=Location

                when ClientEventLog::ACCOUNT_CHANGED
                    # Increase the online count for the new account
                    # Decrease the online count for the old account
                    from = evt.data["event_data"]["from"]
                    to = evt.data["event_data"]["to"]
                    update_aggregator_change! client, evt, from, to, aggregators["account"], model=Account

                when ClientEventLog::AS_CHANGED
                    # See if the organization is the same and if not:
                    # Increase the online count for the new AS organization
                    # Decrease the online count for the old AS organization
                    from = evt.data["event_data"]["from"]
                    to = evt.data["event_data"]["to"]
                    update_aggregator_change! client, evt, from, to, aggregators["as_org"] do |id|
                        AutonomousSystemOrg.joins(:autonomous_systems).find_by("autonomous_systems.id = ?", id)
                    end
                when ClientEventLog::IN_SERVICE
                    aggregates.map{|agg| agg.client_in_service! client, evt if agg}
                    
                when ClientEventLog::NOT_IN_SERVICE
                    aggregates.map{|agg| agg.client_not_in_service! client, evt if agg}
                end

                consumer_offset.offset = evt.id
                consumer_offset.save!
            end
        end
    end

    private

    def self.get_aggregate(id, aggregator_cache, model=nil, &block)
        if id.present? && aggregator_cache[id].nil?
            if model.nil?
                model_obj = block.call(id)
            else
                model_obj = model.find(id)
            end
            aggregator_cache[id] = ClientCountAggregate.find_or_create_by(aggregator: model_obj)
        end
        return aggregator_cache[id]
    end

    def self.update_aggregator_change!(client, evt, from, to, aggregator_cache, model=nil, &block)
        old_aggregate = get_aggregate(from, aggregator_cache, model=model, &block)
        new_aggregate = get_aggregate(to, aggregator_cache, model=model, &block)
        if old_aggregate != new_aggregate
            # update aggregators
            new_aggregate.new_client! client, evt if new_aggregate
            old_aggregate.client_removed! client, evt if old_aggregate
        end
    end
end
