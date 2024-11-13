namespace :dev do
  desc "Fill the DB with 'n_dots' networks placed around the US"
  task :fill_networks, [:n_dots, :cleanup] => [:environment] do |t, args|
    cleanup = args[:cleanup] || false
    MobileScanNetwork.delete_all if cleanup
    device_id = SecureRandom.uuid
    m_user = MobileUserDevice.create!(user: User.first, device_id: device_id)
    scan = MobileScanSession.create(mobile_user_device: m_user)

    total_networks = MobileScanNetwork.all.count
    n_dots = args[:n_dots]&.to_i || 0

    networks = ((total_networks + 1)..n_dots).map do |i|
      # US BBOX
      long = rand(-123.540..-68.286)
      lat = rand(26.355..48.469)
      network_type = [:cell, :wifi].sample
      distinct_networks = n_dots / 100 || 1 # One distinct network for every 100 dots
      network_id = rand(1..distinct_networks)

      {
        network_type: network_type,
        network_id: "#{network_type}-#{i}",
        name: "#{network_type}-#{network_id}".titleize,
        lonlat: "POINT(#{long} #{lat})",
        found_by_session_id: scan.id,
        created_at: Time.now,
        updated_at: Time.now,
      }
    end

    MobileScanNetwork.insert_all!(networks) unless networks.empty?
    VectorTiles.invalidate_all_cache!(VectorTiles::Namespaces::NETWORKS)
  end
end
