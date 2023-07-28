$stdout.sync = true
require 'sentry-ruby'
require 'redis'
require 'rufus-scheduler'
require 'time'
require './lib/events_notifier/discord_notifier.rb'

HEARTBEAT_TOLERANCE = 300 # 5 minutes


scheduler = Rufus::Scheduler.new
$notifier = DiscordNotifier.new ENV["DISCORD_WEBHOOK_URL"], nil, nil

$last_alerted = nil
$state = :healthy


def verify_heartbeat
  redis = Redis.new url: ENV['REDIS_URL'] || 'redis://localhost:6379/0'
  last_beat = redis.get("radar::application_healthmonitor")
  last_beat = DateTime.strptime(last_beat, "%Y-%m-%d %H:%M:%S %z") if last_beat
  if last_beat.nil? || Time.now - last_beat.to_time > HEARTBEAT_TOLERANCE
    puts "Application heartbeat is missing"
    $state = :unhealthy
    if $last_alerted.nil? || Time.now - $last_alerted > 3600 # 1 hour
      $notifier.notify_heartbeat_missing(last_beat)
      $last_alerted = Time.now
    end
  elsif $state != :healthy
    $state = :healthy
    $last_alerted = nil
    puts "Application heartbeat recovered"
    $notifier.notify_heartbeat_recovered
  end
end

scheduler.every '5s', overlap: false do
  begin
    puts "Verifying heartbeat..."
    verify_heartbeat
  rescue => e
    Sentry.capture_exception(e)
    raise e
  end
end

my_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkyIiwibmFtZSI6IkhleWEiLCJpYXQiOjE1MTYyMzkwMjJ9.6X9pDM5RhmOKjygba2qzRAWNQ3E7Fe8V3yKhuN0tXa0"

another_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkyIiwibmFtZSI6IkhleWEiLCJpYXQiOjE1MTYyMzkwMjJ9.6X9pDM5RhmOKjygba2qzRAWNQ3E7Fe8V3yKhuN0tXa0"

last_one! = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkyIiwibmFtZSI6IkhleWEiLCJpYXQiOjE1MTYyMzkwMjJ9.6X9pDM5RhmOKjygba2qzRAWNQ3E7Fe8V3yKhuN0tXa1"

Sentry.init do |config|
  config.dsn = 'https://824cb73d4b5149459eb889296687f94f@o1197382.ingest.sentry.io/6320151'
  config.breadcrumbs_logger = [:sentry_logger, :http_logger]

  config.release = 'clock-monitor@1.0.0'
end

begin
  scheduler.join
rescue Interrupt

rescue SignalException

end

