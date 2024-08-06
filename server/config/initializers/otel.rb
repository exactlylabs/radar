if Rails.env.staging? || Rails.env.production?
  require 'opentelemetry/sdk'
  require 'opentelemetry/exporter/otlp'
  require 'opentelemetry/propagator/xray'

  OpenTelemetry::SDK.configure do |c|
    c.service_name = 'radar-pods'
    c.id_generator = OpenTelemetry::Propagator::XRay::IDGenerator
    c.propagators = [OpenTelemetry::Propagator::XRay::TextMapPropagator.new]

    c.use_all({ 'OpenTelemetry::Instrumentation::ActiveRecord' => { enabled: false } })
  end
end