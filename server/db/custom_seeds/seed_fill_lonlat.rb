Location.with_deleted.all.each do |location|
  location.lonlat = "POINT(#{location.longitude} #{location.latitude})"
  location.save!
end