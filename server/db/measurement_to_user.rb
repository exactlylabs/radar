Measurement.all.each do |m|
  if m.location
    m.user = m.location.user
    m.save
  elsif m.client
    m.user = m.client.user
    m.save
  end
end
