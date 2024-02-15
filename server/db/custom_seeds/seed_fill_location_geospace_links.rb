# Remove geospaces that don't match the location's lonlat and search for all that do match and link them to it.

Location.all.each do |location|
  if location.lonlat.nil? && location.longitude.present? && location.latitude.present?
    location.lonlat = "POINT(#{location.longitude} #{location.latitude})"
    location.save
  elsif location.lonlat.nil?
    next
  end

  location.geospaces.excluding_lonlat(location.lonlat).each do |geospace|
    location.geospaces.delete geospace
  end
  Geospace.containing_lonlat(location.lonlat).each do |geospace|
    location.geospaces << geospace unless location.geospaces.include? geospace
  end
end
