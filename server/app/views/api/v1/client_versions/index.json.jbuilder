json.results @client_versions do |client_version|
  json.partial! "api/v1/client_versions/client_version", client_version: client_version
end