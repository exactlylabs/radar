require 'csv'
require 'ipaddr'

module GeoTools
  @@asn_finder = nil

  class ASNFinder
    attr_reader :asns

    def initialize
      if ENV['RAILS_ENV'].present? && ENV['RAILS_ENV'] != 't' && ENV['RAILS_ENV'] != 'development'
        @org2info_filepath = ENV["ASN_ORG2INFO_FILEPATH"] || "./lib/geotools/files/as-org2info.jsonl"
        @asnipv4_filepath = ENV["ASN_IPV4_FILEPATH"] || "./lib/geotools/files/GeoLite2-ASN-Blocks-IPv4.csv"
        @asnipv6_filepath = ENV["ASN_IPV6_FILEPATH"] || "./lib/geotools/files/GeoLite2-ASN-Blocks-IPv6.csv"
      end
      @asns = {}
      # @ipv4asns = []
      # @ipv6asns = []
      mount_objects
    end

    def load_asn_ipv4
      return if @asnipv4_filepath.nil?
      CSV.foreach((@asnipv4_filepath), headers: true, col_sep: ",") do |row|
        if @asns[row["autonomous_system_number"]].present?
          @asns[row["autonomous_system_number"]].ipv4 << IPAddr.new(row["network"])
        end
      end
    end

    def load_asn_ipv6
      return [] if @asnipv6_filepath.nil?
      CSV.foreach((@asnipv6_filepath), headers: true, col_sep: ",") do |row|
        if @asns[row["autonomous_system_number"]].present?
          @asns[row["autonomous_system_number"]].ipv6 << IPAddr.new(row["network"])
        end
      end
    end

    def load_jsonl_file
      return [] if @org2info_filepath.nil?
      File.open @org2info_filepath do |file_handle|
        content = []
        file_handle.each_line do |row|
          content.append(JSON.parse row)
        end
        return content
      end
    end

    def mount_objects
      orgs = {}
      Rails.logger.debug("Loading ASN data")
      load_jsonl_file.each do |row|
        if row["type"] == "Organization"
          orgs[row["organizationId"]] = GeoTools::ASOrg.new row["name"], row["organizationId"], row["country"], row["source"]
        elsif row["type"] == "ASN"
          org = orgs[row["organizationId"]]
          @asns[row["asn"]] = AutonomousSystem.new row["name"], row["asn"], org
        end
      end
      Rails.logger.debug("Mounting ASN IPs map")
      # Now iterate through the ipv4 and ipv6 map files to fill that info
      threads = []
      threads << Thread.new do
        load_asn_ipv4
      end
      threads << Thread.new do
        load_asn_ipv6
      end
      threads.each(&:join)
      return nil
    end

    def find(ip)
      return [] if Rails.env.development?
      ipaddr = IPAddr.new ip
      iptype = ipaddr.ipv4? ? "ipv4" : "ipv6"
      matches = []

      if iptype == "ipv4"
        @asns.values.each do |asn|
          asn.ipv4.each do |ip|
            if ip.include?(ipaddr)
              matches << {asn: asn, ip: ip}
            end
          end
        end
      else
        @asns.values.each do |asn|
          asn.ipv6.each do |ip|
            if ip.include?(ipaddr)
              matches << {asn: asn, ip: ip}
            end
          end
        end
      end
      # From all matches, select the more specific one
      matches.sort_by { |match| match[:ip].prefix }.last.fetch(:asn, nil)
    end
  end

  def self.asn_from_ip(ip)
    return nil if Rails.env.development?
    if @@asn_finder.nil?
      @@asn_finder = GeoTools::ASNFinder.new
    end
    @@asn_finder.find ip
  end

  def self.get_county_as_orgs(fips)
    base_url = ENV["BROADBANDMAPPING_API_URL"] || "https://api.mapping.exactlylabs.com"
    results = []
    next_url = "#{base_url}/api/v1/namespaces/counties/geospaces/#{fips}/asns?limit=1000"
    while next_url
      response = HTTP.get(next_url)
      if response.code != 200
        raise "Status #{response.code} getting ASNs for county #{fips}: #{response.body}"
      end
      res = response.parse
      res["results"].each do |as_org|
        # The API returns only the name, and that's sufficient for our purposes
        results << GeoTools::ASOrg.new(as_org["organization"], nil, nil, nil)
      end
      next_url = res["_links"]["next"]
    end
    return results
  end

  class ASOrg
    attr_accessor :name, :id, :country, :source

    def initialize(name, id, country, source)
      @name = name
      @id = id
      @country
      @source
    end
  end

  class AutonomousSystem
    attr_accessor :name, :asn, :organization, :ipv4, :ipv6

    def initialize(name, asn, organization)
      @name = name
      @asn = asn
      @organization = organization
      @ipv4 = []
      @ipv6 = []
    end

    def ip
      @ipv4 || @ipv6
    end
  end
end
