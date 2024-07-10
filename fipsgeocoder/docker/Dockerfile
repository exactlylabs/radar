# syntax=docker/dockerfile:1.2
# use ./scripts/build_image.sh <access_token> to correctly build this image

FROM --platform=${BUILDPLATFORM} golang:1.18.2-alpine3.15 as builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

WORKDIR /go/src/github.com/exactlylabs/radar/fipsgeocoder

RUN apk add git

# Configurations to access the private repos
ENV GOPRIVATE=github.com/exactlylabs/*

# Configure git to use the access token provided by the secret file
# RUN --mount=type=secret,id=ghsecret export $(cat /run/secrets/ghsecret) && git config --global url.https://${GH_ACCESS_TOKEN}@github.com/exactlylabs/.insteadof https://github.com/exactlylabs/

COPY go.mod go.sum ./

RUN --mount=type=secret,id=gitconfig,dst=/root/.gitconfig GOPRIVATE=github.com/exactlylabs/* go mod download
COPY .  ./

RUN GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o start_server ./cmd/start_server/main.go

#---------------------------------------------------------#
FROM --platform=${TARGETPLATFORM} alpine:3.14.0

WORKDIR /app

# Copy the binary
COPY --from=builder /go/src/github.com/exactlylabs/radar/fipsgeocoder/start_server ./
COPY --from=builder /go/src/github.com/exactlylabs/radar/fipsgeocoder/scripts/docker-entrypoint ./

RUN chmod +x docker-entrypoint
RUN chmod +x start_server

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint" ]
CMD ["./start_server"]
