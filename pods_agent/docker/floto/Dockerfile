FROM golang:1.22.2-alpine as builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o /app/radar-agent cmd/start_agent/main.go

FROM alpine:latest as runner

RUN apk add jq

WORKDIR /app

COPY --from=builder /app/radar-agent /app/radar-agent

RUN chmod +x /app/radar-agent

RUN addgroup -S radar && adduser -G radar -S radar


COPY ./docker/floto/docker-entrypoint /app/docker-entrypoint

RUN chmod +x /app/docker-entrypoint

RUN chown -R radar:radar /app

USER radar

# Set the default config path to the persisted volume according to FLOTO docs:
# https://github.com/UChicago-FLOTO/docs/blob/master/user/application_user.md#create-an-application
ENV RADAR_CONFIG_PATH="/public/radar/radar-agent.conf"

ENTRYPOINT ["/app/docker-entrypoint"]

CMD ["/app/radar-agent", "agent"]

