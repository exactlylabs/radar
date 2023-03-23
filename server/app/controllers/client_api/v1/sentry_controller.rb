module ClientApi
  module V1
    # https://docs.sentry.io/platforms/javascript/troubleshooting/
    class SentryController < ApiController
      
      SENTRY_HOST = ENV['SENTRY_HOST']
      SENTRY_PROJECT_ID = ENV['SENTRY_PROJECT_ID']

      def tunnel
        envelope = request.body.read
        piece = envelope.split("\n").first
        header = JSON.parse(piece)
        dsn = URI.parse(header['dsn'])
        project_id = dsn.path.tr('/', '')

        raise "Invalid sentry hostname: #{dsn.hostname}" unless SENTRY_HOST == dsn.hostname
        raise "Invalid sentry project id: #{project_id}" unless SENTRY_PROJECT_ID == project_id

        upstream_sentry_url = "https://#{SENTRY_HOST}/api/#{project_id}/envelope/"
        Net::HTTP.post(URI(upstream_sentry_url), envelope)

        head(:ok)
      end

    end
  end
end