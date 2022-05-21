# syntax=docker/dockerfile:1.2
# use ./scripts/build_image.sh <access_token> to correctly build this image

FROM golang:1.18.2-alpine3.15 as builder

WORKDIR /go/src/github.com/exactlylabs/radar/fipsgeocoder

RUN apk add git

# Configurations to access the private repos
ENV GOPRIVATE=github.com/exactlylabs/*

# Configure git to use the access token provided by the secret file
# RUN --mount=type=secret,id=ghsecret export $(cat /run/secrets/ghsecret) && git config --global url.https://${GH_ACCESS_TOKEN}@github.com/exactlylabs/.insteadof https://github.com/exactlylabs/

COPY go.mod go.sum ./

RUN --mount=type=secret,id=gitconfig,dst=/root/.gitconfig GOPRIVATE=github.com/exactlylabs/* go mod download
COPY .  ./
RUN go build -o start_server ./cmd/start_server/main.go

#---------------------------------------------------------#
FROM alpine:3.14.0

WORKDIR /app

# Copy the binary and default shape files
COPY --from=builder /go/src/github.com/exactlylabs/radar/fipsgeocoder/start_server ./
COPY --from=builder /go/src/github.com/exactlylabs/radar/fipsgeocoder/shapes/ ./shapes/

# Create user to run as non root
RUN adduser -D appuser

# Change permission to non root user
RUN chown -R appuser .

# Don't run as root
USER appuser
EXPOSE 5000
CMD ["./start_server"]
