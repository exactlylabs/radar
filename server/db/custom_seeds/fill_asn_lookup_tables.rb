asns = {}
orgs = {}

puts "Mounting AS Orgs map"

File.open Rails.root.join("lib", "geotools", "files", "as-org2info.jsonl") do |file|
  version = File.read Rails.root.join("lib", "geotools", "files", ".as-org2info_version")

  file.each_line do |row|
    row = JSON.parse row
    if row["type"] == "Organization"
      orgs[row["organizationId"]] = AutonomousSystemOrg.upsert({
        name: row["name"],
        org_id: row["organizationId"],
        country: row["country"],
        source: row["source"],
        source_file_timestamp: version,
        created_at: Time.now,
        updated_at: Time.now
      }, unique_by: :org_id, returning: :id).rows[0][0]

    elsif row["type"] == "ASN"
      asns[row["asn"]] = AutonomousSystem.upsert({
        name: row["name"],
        asn: row["asn"],
        autonomous_system_org_id: orgs[row["organizationId"]],
        opaque_id: row["opaqueId"],
        source: row["source"],
        source_file_timestamp: version,
        created_at: Time.now,
        updated_at: Time.now
      }, unique_by: :asn, returning: :id).rows[0][0]
    end
  end
end


puts "Mounting ASN IPs map"

# It's better to recreate the contents as this is a lookup table and shouldn't be referenced.
# Otherwise we would have to check for updates and deletions and it would be error-prone
AsnIpLookup.delete_all

values = []
version = File.read Rails.root.join("lib", "geotools", "files", ".geo_lite2_version")

puts "Mounting IPV4"
CSV.foreach(Rails.root.join("lib", "geotools", "files", "GeoLite2-ASN-Blocks-IPv4.csv"), headers: true, col_sep: ",") do |row|
  asn = row["autonomous_system_number"]
  unless asn.nil? || asn == "" || asns[asn.to_s].nil?
    values << {autonomous_system_id: asns[asn.to_s], ip: row["network"], source_file_timestamp: version}
  end
end


puts "Mounting IPV6"
CSV.foreach(Rails.root.join("lib", "geotools", "files", "GeoLite2-ASN-Blocks-IPv6.csv"), headers: true, col_sep: ",") do |row|
  asn = row["autonomous_system_number"]
  unless asn.nil? || asn == "" || asns[asn.to_s].nil?
    values << {autonomous_system_id: asns[asn.to_s], ip: row["network"], source_file_timestamp: version}
  end
end

AsnIpLookup.insert_all(values)

puts "Finished Importing asn lookup tables"
