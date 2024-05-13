FROM alpine:latest

WORKDIR /app

RUN apk add jq curl

RUN curl -o /app/radar-agent https://pods.radartoolkit.com/client_versions/stable/distributions/linux-arm64/download


WORKDIR /app

RUN chmod +x /app/radar-agent

RUN addgroup -S radar && adduser -G radar -S radar

COPY ./docker/floto/docker-entrypoint /app/docker-entrypoint
COPY ./docker/floto/run-server /app/run-server

RUN chmod +x /app/docker-entrypoint
RUN chmod +x /app/run-server

RUN chown -R radar:radar /app

USER radar

# Set the default config path to the persisted volume according to FLOTO docs:
# https://github.com/UChicago-FLOTO/docs/blob/master/user/application_user.md#create-an-application
ENV RADAR_CONFIG_PATH="/public/radar/radar-agent.conf"

ENTRYPOINT ["/app/docker-entrypoint"]

CMD ["/app/run-server"]

