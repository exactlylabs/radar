FROM golang:1.22-alpine as build

ARG  OTEL_VERSION=0.103.1

WORKDIR /app

RUN go install go.opentelemetry.io/collector/cmd/builder@v${OTEL_VERSION}

COPY ./config.yaml .

RUN CGO_ENABLED=0 builder --config=config.yaml

FROM alpine:3.20

COPY --from=build /app/bin/otel-collector /

EXPOSE 4317/tcp

ENTRYPOINT ["/otel-collector"]
