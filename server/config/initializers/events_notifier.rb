require "./lib/events_notifier/local_notifier.rb"
require "./lib/events_notifier/discord_notifier.rb"


EventsNotifier.configure do |config|
  webhook_url = ENV["EVENTS_NOTIFIER_DISCORD_WEBHOOK"]
  if webhook_url.present?
    config.notifiers = [
      DiscordNotifier.new(webhook_url)
    ]

  else
    config.notifiers = [
      LocalNotifier.new
    ]

  end
end
