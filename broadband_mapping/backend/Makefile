all: setup ingestor mapping-api

setup:
	go run cmd/setup_shapes/main.go

ingestor:
	go build -o mlab-ingestor cmd/ingestor_service/main.go

mapping-api:
	go build -o mapping-api cmd/server/main.go
