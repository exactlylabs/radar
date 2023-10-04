class FindAsnByIp < ApplicationJob
    queue_as :default

    def perform(obj)
        # populates the "autonomous_system" attribute of a model object,
        # it expects the same model to also have an "ip" attribute
        if obj.ip.blank?
            obj.autonomous_system = nil
            obj.save!
            return
        end

        geo_as = GeoTools::asn_from_ip obj.ip
        if geo_as.blank?
            obj.autonomous_system = nil
            obj.save!
            return
        end

        as = AutonomousSystem.find_by_asn(geo_as.asn)
        if as.nil?
            # Create one
            org = AutonomousSystemOrg.find_by_org_id(geo_as.organization.id)
            if org.nil?
                org = AutonomousSystemOrg.create(
                    name: geo_as.organization.name,
                    org_id: geo_as.organization.id,
                    country: geo_as.organization.country,
                    source: geo_as.organization.source,
                )
            end
            as = AutonomousSystem.create(
                name: geo_as.name,
                autonomous_system_org: org,
                asn: geo_as.asn,
            )
        end

        # If this obj has a location, grab all geospaces and link them to the AS org
        if obj.location.present?
            obj.location.geospaces.each do |gs|
                gs.autonomous_system_orgs << as.autonomous_system_org unless gs.autonomous_system_orgs.include? as.autonomous_system_org
            end
        end

        obj.autonomous_system = as
        obj.save!
    end
end
