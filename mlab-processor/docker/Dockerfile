FROM --platform=${BUILDPLATFORM} golang:1.25-alpine as builder

WORKDIR /go/src/github.com/exactlylabs/mlab-processor

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH


RUN apk add git gcc g++

COPY go.mod go.sum ./
RUN go mod download

COPY . ./

RUN GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o mlab-processor ./cmd/processor/main.go

#---------------------------------------------------------#

FROM --platform=${TARGETPLATFORM} alpine:3.22

WORKDIR /app

RUN apk add --no-cache tzdata curl gzip bash zip unzip

COPY --from=builder /go/src/github.com/exactlylabs/mlab-processor/mlab-processor ./
COPY ./scripts ./scripts

RUN chmod -R +x ./scripts
RUN chmod +x mlab-processor

ENTRYPOINT [ "./scripts/docker-entrypoint" ]
# Resident container: legacy loop mode. For a systemd timer run the binary without -loop.
CMD [ "./mlab-processor", "-loop" ]

