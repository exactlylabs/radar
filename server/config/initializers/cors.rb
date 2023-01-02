Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins (ENV["CORS_ALLOWED_ORIGINS"] || 'http://localhost:9999').split(",").map(&:strip)
    resource '/client_api/v1/*',
             methods: [:get, :post, :options],
             headers: :any
    resource '/geocode',
             methods: [:post, :options],
             headers: :any
  end
end
