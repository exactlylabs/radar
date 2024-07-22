# syntax=docker/dockerfile:1.2

FROM --platform=${BUILDPLATFORM} golang:1.18.2-alpine3.15 as setup

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

WORKDIR /go/src/github.com/exactlylabs/mlab-mapping/backend

RUN apk add git gcc g++

COPY go.mod go.sum ./

RUN go install github.com/swaggo/swag/cmd/swag@latest
RUN go get ./...

COPY .  ./

RUN go generate ./pkg/app/webapi/webapi.go

FROM --platform=${TARGETPLATFORM} golang:1.18.2-alpine3.15 as builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

WORKDIR /go/src/github.com/exactlylabs/mlab-mapping/backend

RUN apk add git gcc g++

COPY go.mod go.sum ./

RUN go install github.com/swaggo/swag/cmd/swag@latest
RUN go get ./...

COPY .  ./

COPY --from=setup /go/src/github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/docs.go /go/src/github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/docs.go
COPY --from=setup /go/src/github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/swagger.json /go/src/github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/swagger.json
COPY --from=setup /go/src/github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/swagger.yaml /go/src/github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi/swagger.yaml

RUN CGO_ENABLED=1 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o start_server ./cmd/server/main.go

#---------------------------------------------------------#
FROM --platform=${TARGETPLATFORM} tailscale/tailscale:stable


WORKDIR /app

RUN apk add --no-cache tzdata

# Copy the binary
COPY --from=builder /go/src/github.com/exactlylabs/mlab-mapping/backend/start_server ./
COPY --from=builder /go/src/github.com/exactlylabs/mlab-mapping/backend/scripts/docker-entrypoint ./

RUN chmod +x docker-entrypoint
RUN chmod +x start_server

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint"]
CMD ["./start_server", "-addr", "0.0.0.0:5000"]
