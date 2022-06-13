json.results @packages do |package|
  json.partial! "api/v1/packages/package", package: package
end