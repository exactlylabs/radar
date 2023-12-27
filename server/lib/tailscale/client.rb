module Tailscale
  class Client

    def initialize
      @client = OAuth2::Client.new(
        ENV['TAILSCALE_CLIENT_ID'],
        ENV['TAILSCALE_CLIENT_SECRET'],
        site: 'https://api.tailscale.com/api/v2',
        token_url: 'https://api.tailscale.com/api/v2/oauth/token',
        connection_opts: {
          headers: {
            'url': 'https://api.tailscale.com/api/v2',
            'Content-Type' => 'application/json',
          }
        }
      )

    end

    def device_auth_key()
      access = @client.client_credentials.get_token
      res = access.post('https://api.tailscale.com/api/v2/tailnet/-/keys', body: {
        capabilities: {
          devices: {
            create: {
              reusable: false,
              ephemeral: true,
              preauthorized: true,
              tags: ["tag:pod"],
            }
          },
        }
      }.to_json)
      res.parsed
    end

    def revoke_key(key_id)
      access = @client.client_credentials.get_token
      res = access.delete("https://api.tailscale.com/api/v2/tailnet/-/keys/#{key_id}")
      res.parsed
    end

    def list_keys()
      access = @client.client_credentials.get_token
      res = access.get("https://api.tailscale.com/api/v2/tailnet/-/keys")
      res.parsed
    end

    def get_key(key_id)
      access = @client.client_credentials.get_token
      res = access.get("https://api.tailscale.com/api/v2/tailnet/-/keys/#{key_id}")
      res.parsed
    end
  end
end
