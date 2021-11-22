Client.all.each do |client|
  location = Location.create(
    name: client.name,
    address: client.address,
    latitude: client.latitude,
    longitude: client.longitude,
    user: client.user
  )

  client.measurements.update_all(location_id: location.id)
end
