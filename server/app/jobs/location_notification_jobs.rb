require 'sidekiq/api'

module LocationNotificationJobs

  class LocationNotificationJob < ApplicationJob
    queue_as :notifications
    sidekiq_options retry: false
    around_enqueue do |_job, block|
      # Check Sidekiq API and see if this job is already running/enqueued
      already_enqueued = false
      Sidekiq::Queue.new("notifications").each do |j|
        if j.args[0]["job_class"] == self.class.name
          already_enqueued = true
        end
      end
      Sidekiq::WorkSet.new.each do |process_id, thread_id, work|
        if JSON.parse(work["payload"])["args"][0]["job_class"] == self.class.name
          already_enqueued = true
        end
      end
      block.call unless already_enqueued
    end

    def location_info(location, as_org=nil)
      state = location.state_geospace
      county = location.county_geospace
      place = location.place_geospace
      per_county_count = county&.locations&.where_online&.count || 0
      per_place_count = place&.locations&.where_online&.count || 0
      per_isp_county_count = nil
      per_isp_count = nil
      if as_org.present?
        per_isp_county_count = county&.locations&.where_online&.joins(:clients => :autonomous_system)&.where("autonomous_systems.autonomous_system_org_id": as_org.id)&.count("DISTINCT(locations.id)") || 0
        per_isp_count = Client.where_online.joins(:autonomous_system).where("autonomous_systems.autonomous_system_org_id": as_org.id).count || 0
      end

      EventsNotifier::LocationInfo.new(
        location, state, county, place,
        as_org: as_org,
        locations_per_county_count: per_county_count,
        locations_per_place_count: per_place_count,
        locations_per_isp_county_count: per_isp_county_count,
        locations_per_isp_count: per_isp_count
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
      EventsNotifier.notify_location_online(location_info) unless location.notified_when_online?
      location.update(notified_when_online: true)

      return unless location_info&.state&.study_geospace?

      county_goal = location_info&.county.study_aggregate_by_level('county')&.locations_goal || Location::LOCATIONS_PER_COUNTY_GOAL
      place_goal = location_info&.place.study_aggregate_by_level('census_place')&.locations_goal || Location::LOCATIONS_PER_PLACE_GOAL

      isp_county_goal = Location::LOCATIONS_PER_ISP_PER_COUNTY_GOAL
      if as_org.present?
        isp_county_goal = location_info&.county.study_aggregate_by_level('isp_county')&.locations_goal || Location::LOCATIONS_PER_ISP_PER_COUNTY_GOAL
      end

      # Notify Goals if reached
      if location_info.extra[:locations_per_county_count] && location_info.extra[:locations_per_county_count] >= county_goal &&
         !NotifiedStudyGoal.where(geospace: location_info.county, autonomous_system_org: nil).exists?
        EventsNotifier.notify_study_goal_reached(location_info.county, county_goal)
        NotifiedStudyGoal.create!(geospace: location_info.county, autonomous_system_org: nil)
      end
      if location_info.extra[:locations_per_place_count] && location_info.extra[:locations_per_place_count] >= place_goal &&
          !NotifiedStudyGoal.where(geospace: location_info.place).exists?
        EventsNotifier.notify_study_goal_reached(location_info.place, place_goal)
        NotifiedStudyGoal.create!(geospace: location_info.place)
      end
      if location_info.extra[:locations_per_isp_county_count] && location_info.extra[:locations_per_isp_county_count] >= isp_county_goal &&
          !NotifiedStudyGoal.where(geospace: location_info.county, autonomous_system_org: as_org).exists?
        EventsNotifier.notify_study_goal_reached(location_info.county, isp_county_goal, as_org=as_org)
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
