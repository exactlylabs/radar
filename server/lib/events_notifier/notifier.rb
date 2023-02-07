module EventsNotifier
  class Notifier
    def notify_new_account(account, contact)
      raise 'Not Implemented'
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
end
