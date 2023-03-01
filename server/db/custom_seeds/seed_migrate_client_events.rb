# Custom seed file for running once

# Migrates ClientEventLog to Events table

# To run, execute the following command:
# `rails runner db/custom_seeds/seed_migrate_client_events.rb` inside the
# /server directory.


ClientEventLog.all.order("id ASC").each do |event|
  version = Event.last_version_from(event.client) + 1
  new_event = Event.new aggregate: event.client, timestamp: event.timestamp, version: version
  
  case event.name
  when ClientEventLog::CREATED
    event_data = event.data["state"]
    new_event.name = Client::Events::CREATED
    new_event.data = event_data
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: event.data["state"])

  when ClientEventLog::WENT_ONLINE
    event_data = {"from": false, "to": true}
    new_event.name = Client::Events::WENT_ONLINE
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    state["online"] = true
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  when ClientEventLog::WENT_OFFLINE
    event_data = {"from": true, "to": false}
    new_event.name = Client::Events::WENT_OFFLINE
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    state["online"] = false
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  when ClientEventLog::SERVICE_STARTED
    event_data = {}
    new_event.name = Client::Events::SERVICE_STARTED
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  when ClientEventLog::LOCATION_CHANGED
    event_data = {"from": event.data["event_data"]["from"], "to": event.data["event_data"]["to"]}
    new_event.name = Client::Events::LOCATION_CHANGED
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    state["location_id"] = event.data["event_data"]["to"]
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  when ClientEventLog::ACCOUNT_CHANGED
    event_data = {"from": event.data["event_data"]["from"], "to": event.data["event_data"]["to"]}
    new_event.name = Client::Events::ACCOUNT_CHANGED
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    state["account_id"] = event.data["event_data"]["to"]
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  when ClientEventLog::IP_CHANGED
    event_data = {"from": event.data["event_data"]["from"], "to": event.data["event_data"]["to"]}
    new_event.name = Client::Events::IP_CHANGED
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    state["ip"] = event.data["event_data"]["to"]
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  when ClientEventLog::AS_CHANGED
    event_data = {"from": event.data["event_data"]["from"], "to": event.data["event_data"]["to"]}
    new_event.name = Client::Events::AS_CHANGED
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    state["autonomous_system_id"] = event.data["event_data"]["to"]
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  when ClientEventLog::IN_SERVICE
    event_data = {"from": false, "to": true}
    new_event.name = Client::Events::IN_SERVICE
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    state["in_service"] = true
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  when ClientEventLog::NOT_IN_SERVICE
    event_data = {"from": true, "to": false}
    new_event.name = Client::Events::NOT_IN_SERVICE
    new_event.data = event_data
    state = Snapshot.last_from(event.client).state
    state["in_service"] = false
    new_event.save!
    Snapshot.create(aggregate: event.client, event: new_event, state: state)

  end
end
