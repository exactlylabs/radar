# Build a Tailscale image that is able to load secrets from Docker Secrets as environment variables for the binary

FROM tailscale/tailscale:latest

COPY ./docker-entrypoint /usr/local/bin/docker-entrypoint

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]

# This is the original CMD from the Tailscale image (took it using docker inspect)
CMD ["/usr/local/bin/containerboot"]
