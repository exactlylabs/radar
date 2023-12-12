$location_pods_count = {}
Location.unscoped.each do |loc|
  $location_pods_count[loc.id] = 0
end

$last_event_by_id = {}

def decr_location_count(location_id, timestamp)
  $location_pods_count[location_id] -= 1
  if $location_pods_count[location_id] == 0
    begin
      Event.create!(
        name: Location::Events::WENT_OFFLINE,
        aggregate: Location.unscoped.find(location_id),
        timestamp: timestamp,
        data: { "to" => false, "from" => true },
        version: Event.last_version_from_type_id_set(Location.name, location_id) + 1
      )
    rescue ActiveRecord::RecordNotFound
    end
  end
end

def incr_location_count(location_id, timestamp)
  $location_pods_count[location_id] ||= 0
  $location_pods_count[location_id] += 1
  if $location_pods_count[location_id] == 1
    begin
      Event.create!(
        name: Location::Events::WENT_ONLINE,
        aggregate: Location.unscoped.find(location_id),
        timestamp: timestamp,
        data: { "to" => true, "from" => false },
        version: Event.last_version_from_type_id_set(Location.name, location_id) + 1
      )
    rescue ActiveRecord::RecordNotFound
    end
  end
end

Event.transaction do
  Snapshot.of(Location).joins(:event).where(events: { name: [Location::Events::WENT_ONLINE, Location::Events::WENT_OFFLINE,] }).delete_all
  Event.of(Location).where_name_is(
    Location::Events::WENT_ONLINE,
    Location::Events::WENT_OFFLINE,
  ).delete_all

  Event.of(Client).where_name_is(
    Client::Events::CREATED,
    Client::Events::LOCATION_CHANGED,
    Client::Events::WENT_ONLINE,
    Client::Events::WENT_OFFLINE,
  ).order(:version).each do |event|
    client_snapshot = event.snapshot
    location_id = client_snapshot.state["location_id"]

    case event.name
    when Client::Events::CREATED
      next unless client_snapshot.state["online"]
      incr_location_count(location_id, event.timestamp) if location_id.present?

    when Client::Events::LOCATION_CHANGED
      next unless client_snapshot.state["online"]
      decr_location_count(event.data["from"], event.timestamp) if event.data["from"].present?
      incr_location_count(event.data["to"], event.timestamp) if event.data["to"].present?

    when Client::Events::WENT_ONLINE
      next if $last_event_by_id[client_snapshot.aggregate_id]&.name == Client::Events::WENT_ONLINE
      incr_location_count(location_id, event.timestamp) if location_id.present?

    when Client::Events::WENT_OFFLINE
      next if $last_event_by_id[client_snapshot.aggregate_id]&.name == Client::Events::WENT_OFFLINE
      decr_location_count(location_id, event.timestamp) if location_id.present?

    end

    $location_pods_count[location_id] = 0 if location_id.present? && $location_pods_count[location_id] < 0
    $last_event_by_id[client_snapshot.aggregate_id] = event
  end

  Snapshot.reprocess_since(nil)
end
