# syntax=docker/dockerfile:1.2

FROM golang:1.18.2-alpine3.15 as builder

WORKDIR /go/src/github.com/exactlylabs/mlab-mapping/backend

RUN apk add git gcc g++

COPY go.mod go.sum ./

COPY .  ./
RUN go build -o start_server ./cmd/server/main.go

#---------------------------------------------------------#
FROM alpine:3.14.0

WORKDIR /app
RUN apk add --no-cache tzdata
# Copy the binary
COPY --from=builder /go/src/github.com/exactlylabs/mlab-mapping/backend/start_server ./

EXPOSE 5000
CMD ["./start_server", "-addr", "0.0.0.0:5000"]