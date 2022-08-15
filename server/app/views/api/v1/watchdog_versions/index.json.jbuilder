json.results @watchdog_versions do |watchdog_version|
  json.partial! "api/v1/watchdog_versions/watchdog_version", watchdog_version: watchdog_version
end