require "./lib/events_notifier/local_notifier.rb"
require "./lib/events_notifier/discord_notifier.rb"


EventsNotifier.configure do |config|
  webhook_url = ENV["EVENTS_NOTIFIER_DISCORD_WEBHOOK"]
  tbp_alerts_webhook_url = ENV["EVENTS_NOTIFIER_DISCORD_TBP_ALERTS_WEBHOOK"]
  tbp_general_webhook_url = ENV["EVENTS_NOTIFIER_DISCORD_TBP_GENERAL_WEBHOOK"]
  if webhook_url.present?
    config.notifiers = [
      DiscordNotifier.new(webhook_url, tbp_alerts_webhook_url, tbp_general_webhook_url)
    ]

  elsif Rails.env.development?
    config.notifiers = [
      LocalNotifier.new
    ]
  else
    config.notifiers = []

  end
end
