require 'csv'
require 'ipaddr'

module GeoTools
    @@asn_finder = nil

    class ASNFinder
        def initialize
            @org2info_filepath = ENV["ASN_ORG2INFO_FILEPATH"] || "./lib/geotools/files/as-org2info.jsonl"
            @asnipv4_filepath = ENV["ASN_IPV4_FILEPATH"] || "./lib/geotools/files/GeoLite2-ASN-Blocks-IPv4.csv"
            @asnipv6_filepath = ENV["ASN_IPV6_FILEPATH"] || "./lib/geotools/files/GeoLite2-ASN-Blocks-IPv6.csv"
            @asns = {}
            @ipv4asns = []
            @ipv6asns = []
            mount_objects
        end

        def load_asn_ipv4
            CSV.foreach((@asnipv4_filepath), headers: true, col_sep: ",") do |row|
                if @asns[row["autonomous_system_number"]].present?
                    as = @asns[row["autonomous_system_number"]].dup
                    as.ip = IPAddr.new row["network"]
                    @ipv4asns.append(as)
                end
            end
        end

        def load_asn_ipv6
            CSV.foreach((@asnipv6_filepath), headers: true, col_sep: ",") do |row|
                if @asns[row["autonomous_system_number"]].present?
                    as = @asns[row["autonomous_system_number"]].dup
                    as.ip = IPAddr.new row["network"]
                    @ipv6asns.append(as)
                end
            end
        end

        def load_jsonl_file
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

            load_jsonl_file.each do |row|
                if row["type"] == "Organization"
                    orgs[row["organizationId"]] = GeoTools::ASOrg.new row["name"], row["organizationId"], row["country"], row["source"]
                elsif row["type"] == "ASN"
                    org = orgs[row["organizationId"]]
                    @asns[row["asn"]] = AutonomousSystem.new row["name"], row["asn"], org 
                end
            end

            # Now iterate through the ipv4 and ipv6 map files to fill that info
            load_asn_ipv4
            load_asn_ipv6
        end

        def find(ip)
            ipaddr = IPAddr.new ip
            iptype = ipaddr.ipv4? ? "ipv4" : "ipv6"
            if iptype == "ipv4"
                @ipv4asns.each do |as|
                    if as.ip.present? && as.ip.include?(ipaddr)
                        return as
                    end
                end
            else
                @ipv6asns.each do |as|
                    if as.ip.present? && as.ip.include?(ipaddr)
                        return as
                    end
                end
            end
            return nil
        end
    end

    def self.asn_from_ip(ip)
        if @@asn_finder.nil?
            @@asn_finder = GeoTools::ASNFinder.new
        end
        @@asn_finder.find ip
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
        attr_accessor :name, :asn, :organization, :ip

        def initialize(name, asn, organization)
            @name = name
            @asn = asn
            @organization = organization
            @ip
        end
    end
end
