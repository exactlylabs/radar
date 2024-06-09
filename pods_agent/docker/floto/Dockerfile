FROM --platform=$BUILDPLATFORM alpine:latest

ARG TARGETPLATFORM
ARG BUILDPLATFORM

RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM"

WORKDIR /app

RUN apk add curl

COPY ./docker/floto/download-binary.sh /app/download-binary.sh

RUN /app/download-binary.sh

FROM alpine:latest

WORKDIR /app

RUN apk add jq

COPY --from=0 /app/radar-agent /app/radar-agent

RUN chmod +x /app/radar-agent

RUN addgroup -S radar && adduser -G radar -S radar

COPY ./docker/floto/run-server /app/run-server

RUN mkdir -p /public/radar

RUN chmod +x /app/run-server

# Set the default config path to the persisted volume according to FLOTO docs:
# https://github.com/UChicago-FLOTO/docs/blob/master/user/application_user.md#create-an-application
ENV RADAR_CONFIG_PATH="/public/radar/radar-agent.conf"

CMD ["/app/run-server"]
