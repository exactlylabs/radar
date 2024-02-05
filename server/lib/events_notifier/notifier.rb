module EventsNotifier
  class Notifier
    def notify_new_account(account, contact)
      raise 'Not Implemented'
    end

    def notify_user_invite_accepted(account, user)
      raise 'Not Implemented'
    end

    def notify_new_location(location_info)
      raise 'Not Implemented'
    end

    def notify_location_online(location_info)
      raise 'Not Implemented'
    end

    def notify_location_offline(location_info)
      raise 'Not Implemented'
    end

    def notify_study_goal_reached(geospace, goal, as_org=nil)
      raise 'Not Implemented'
    end
  end

  class LocationInfo
    attr_accessor :location, :state, :county, :place, :extra

    def initialize(location, state, county, place, **extra)
      @location = location
      @state = state
      @county = county
      @place = place
      @extra = extra
    end
  end

  class << self
    attr_accessor :notifiers
  end

  def self.configure(&block)
    @notifiers ||= []
    block.call(self)
  end

  def self.notify_new_account(account, contact)
    @notifiers.each do |notifier|
      notifier.notify_new_account(account, contact)
    end
  end

  def self.notify_user_invite_accepted(account, user)
    @notifiers.each do |notifier|
      notifier.notify_user_invite_accepted(account, user)
    end
  end

  def self.notify_new_location(location_info)
    @notifiers.each do |notifier|
      notifier.notify_new_location(location_info)
    end
  end

  def self.notify_location_online(location_info)
    @notifiers.each do |notifier|
      notifier.notify_location_online(location_info)
    end
  end

  def self.notify_location_offline(location_info)
    @notifiers.each do |notifier|
      notifier.notify_location_offline(location_info)
    end
  end

  def self.notify_study_goal_reached(geospace, goal, as_org=nil)
    @notifiers.each do |notifier|
      notifier.notify_study_goal_reached(geospace, goal, as_org)
    end
  end

  def self.notify_public_page_submission(submission)
    @notifiers.each do |notifier|
      notifier.notify_public_page_submission(submission)
    end
  end
end
