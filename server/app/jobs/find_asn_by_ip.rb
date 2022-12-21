class FindAsnByIp < ApplicationJob
    queue_as :default

    def perform(obj)
        # populates the "autonomous_system" attribute of a model object,
        # it expects the same model to also have an "ip" attribute
        if !obj.ip.present?
            obj.autonomous_system = nil
            obj.save!
            return
        end

        geoAS = GeoTools::asn_from_ip obj.ip
        if !geoAS.present?
            obj.autonomous_system = nil
            obj.save!
            return
        end

        as = AutonomousSystem.find_by_asn(geoAS.asn)
        if as.nil?
            # Create one
            org = AutonomousSystemOrg.find_by_org_id(geoAS.organization.id)
            if org.nil?
                org = AutonomousSystemOrg.create(
                    name: geoAS.organization.name,
                    org_id: geoAS.organization.id,
                    country: geoAS.organization.country,
                    source: geoAS.organization.source,
                )
            end
            as = AutonomousSystem.create(
                name: geoAS.name,
                autonomous_system_org: org,
                asn: geoAS.asn,
            )
        end

        obj.autonomous_system = as
        obj.save!
    end
end
