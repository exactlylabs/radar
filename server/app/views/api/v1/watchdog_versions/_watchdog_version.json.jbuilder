json.extract! watchdog_version, :id, :version, :is_stable, :created_at, :updated_at
json.binary url_for watchdog_version.binary unless !watchdog_version.binary.attached?
json.signed_binary url_for watchdog_version.signed_binary unless !watchdog_version.signed_binary.attached?
