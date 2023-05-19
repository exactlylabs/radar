json.results @distributions do |distribution|
  json.partial! "api/v1/distributions/distribution", distribution: distribution
end