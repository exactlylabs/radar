if Rails.env.production? || Rails.env.staging?
  Geocoder.configure(
    # Geocoding options
    # timeout: 3,                 # geocoding service timeout (secs)
    lookup: :geoapify,            # name of geocoding service (symbol)
    ip_lookup: :ipinfo_io,        # name of IP address geocoding service (symbol)
    # language: :en,              # ISO-639 language code
    # use_https: false,           # use HTTPS for lookup requests? (if supported)
    # http_proxy: nil,            # HTTP proxy server (user:pass@host:port)
    # https_proxy: nil,           # HTTPS proxy server (user:pass@host:port)
    api_key: ENV["GEOAPIFY_KEY"],               # API key for geocoding service
    # cache: nil,                 # cache object (must respond to #[], #[]=, and #del)
    # cache_prefix: 'geocoder:',  # prefix (string) to use for all cache keys

    # Exceptions that should not be rescued by default
    # (if you want to implement custom error handling);
    # supports SocketError and Timeout::Error
    always_raise: :all,

    # Calculation options
    # units: :mi,                 # :km for kilometers or :mi for miles
    # distances: :linear          # :spherical or :linear
  )
elsif Rails.env.test?
  Geocoder.configure(
    lookup: :test,
    ip_lookup: :test,
    always_raise: :all,
    cache: nil
  )
else
  Geocoder.configure(
    lookup: :nominatim,         # name of geocoding service (symbol)
    # ip_lookup: :ipinfo_io,      # name of IP address geocoding service (symbol)
    always_raise: :all,
    http_headers: { "User-Agent" => "support@exactlylabs.com" }
  )
end
