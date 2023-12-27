# Declare a global client, to be used during the lifetime of the server process.

Rails.configuration.after_initialize do

  TailscaleClient = Tailscale::Client.new
end
