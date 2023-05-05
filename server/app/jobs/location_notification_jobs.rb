module LocationNotificationJobs

  class LocationNotificationJob < ApplicationJob
    def location_info(location, as_org=nil)
      state = location.state_geospace
      county = location.county_geospace
      place = location.place_geospace

      per_county_count = county&.locations&.count || 0
      per_place_count = place&.locations&.count || 0
      per_isp_county_count = nil
      per_isp_count = nil
      if as_org.present?
        per_isp_county_count = county&.locations&.joins(:clients => :autonomous_system)&.where("autonomous_systems.autonomous_system_org_id": as_org.id)&.count("DISTINCT(locations.id)") || 0
        per_isp_count = Client.joins(:autonomous_system).where("autonomous_systems.autonomous_system_org_id": as_org.id).count || 0
      end

      EventsNotifier::LocationInfo.new(
        location, state, county, place, 
        as_org: as_org,
        locations_per_county_count: per_county_count, 
        locations_per_place_count: per_place_count, 
        locations_per_isp_county_count: per_isp_county_count,
        locaions_per_isp_count: per_isp_count
      )
    end
  end

  class NotifyLocationCreated < LocationNotificationJob
    def perform(location)
      location_info = location_info(location)
      EventsNotifier.notify_new_location(location_info)
    end
  end

  class NotifyLocationOnline < LocationNotificationJob
    def perform(location, at)
      as_org = location.clients.order("updated_at DESC").first&.autonomous_system&.autonomous_system_org
      location_info = location_info(location, as_org=as_org)
      EventsNotifier.notify_location_online(location_info)

      # Notify Goals if reached
      if location_info.extra[:locations_per_county_count] && location_info.extra[:locations_per_county_count] >= Location::LOCATIONS_PER_COUNTY_GOAL &&
         !NotifiedStudyGoal.where(geospace: location_info.county, autonomous_system_org: nil).exists?
        EventsNotifier.notify_study_goal_reached(location_info.county, Location::LOCATIONS_PER_COUNTY_GOAL)
        NotifiedStudyGoal.create!(geospace: location_info.county, autonomous_system_org: nil)
      end
      if location_info.extra[:locations_per_place_count] && location_info.extra[:locations_per_place_count] >= Location::LOCATIONS_PER_PLACE_GOAL &&
          !NotifiedStudyGoal.where(geospace: location_info.place).exists?
        EventsNotifier.notify_study_goal_reached(location_info.place, Location::LOCATIONS_PER_PLACE_GOAL)
        NotifiedStudyGoal.create!(geospace: location_info.place)
      end
      if location_info.extra[:locations_per_isp_county_count] && location_info.extra[:locations_per_isp_county_count] >= Location::LOCATIONS_PER_ISP_COUNTY_GOAL &&
          !NotifiedStudyGoal.where(geospace: location_info.county, autonomous_system_org: as_org).exists?
        EventsNotifier.notify_study_goal_reached(location_info.county, Location::LOCATIONS_PER_ISP_COUNTY_GOAL, as_org=as_org)
        NotifiedStudyGoal.create!(geospace: location_info.county, autonomous_system_org: as_org)
      end
    end
  end

  class NotifyLocationOffline < LocationNotificationJob
    def perform(location, at)
      at ||= Time.now
      return if at <  1.day.ago

      as_org = location.clients.order("updated_at DESC").first&.autonomous_system&.autonomous_system_org
      location_info = location_info(location, as_org=as_org)
      EventsNotifier.notify_location_offline(location_info)

    end
  end

end