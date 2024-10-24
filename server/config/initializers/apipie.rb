Apipie.configure do |config|
  config.app_name                = "Radar Mobile API"
  config.api_base_url            = "/mobile_api/v1"
  config.doc_base_url            = "/mobile_api/v1/docs"
  
  config.api_controllers_matcher = "#{Rails.root}/app/controllers/**/*.rb"
end
