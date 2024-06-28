# syntax=docker/dockerfile:1.2

FROM --platform=${BUILDPLATFORM} golang:1.18.2-alpine3.15 as builder

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
RUN GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o start_server ./cmd/server/main.go

#---------------------------------------------------------#
FROM --platform=${TARGETPLATFORM} alpine:3.14.0

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
