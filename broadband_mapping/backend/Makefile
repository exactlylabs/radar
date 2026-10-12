VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

all: setup ingestor mapping-api


.PHONY: setup
setup:
	go run cmd/setup_shapes/main.go


.PHONY: run-server
run-server:
	./scripts/run_server.sh

.PHONY: ingestor
ingestor:
	go build -o mlab-ingestor cmd/ingestor_service/main.go


.PHONY: summarize
summarize:
	go build -o summarize cmd/summarize/main.go


.PHONY: ingest
ingest:
	go build -o ingest cmd/ingest/main.go


.PHONY: convert-measurements
convert-measurements:
	go build -o convert_measurements cmd/convert_measurements/main.go


# Linux amd64 binaries for mapping-db (/opt/broadbandmapping)
.PHONY: pipeline-binaries
pipeline-binaries:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o dist/mlab-ingestor ./cmd/ingestor_service
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o dist/ingest ./cmd/ingest
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o dist/summarize ./cmd/summarize
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o dist/convert_measurements ./cmd/convert_measurements


.PHONY: mapping-api
mapping-api:
	go build -o mapping-api cmd/server/main.go


.PHONY: build
build:
	docker buildx build --provenance=false \
	  --platform linux/arm64,linux/amd64 \
		-f docker/Dockerfile \
		-t mapping-api:$(VERSION) .

	docker tag mapping-api:$(VERSION) mapping-api:latest


.PHONY: build-setup-shapes
build-setup-shapes:
	docker buildx build --provenance=false \
	  --platform linux/arm64,linux/amd64 \
		-f docker/Dockerfile.setup-shapes \
		-t mapping-setup-shapes:$(VERSION) .

	docker tag mapping-setup-shapes:$(VERSION) mapping-setup-shapes:latest


.PHONY: build-mlab-ingestor
build-mlab-ingestor:
	docker buildx build --provenance=false \
	  --platform linux/amd64 \
		-f docker/Dockerfile.ingestor \
		-t mlab-ingestor:$(VERSION) .

	docker tag mlab-ingestor:$(VERSION) mlab-ingestor:latest


.PHONY: push-api
push-api: build build-setup-shapes
	docker tag mapping-api:$(VERSION) registry.radartoolkit.com/mapping-api:$(VERSION)
	docker tag mapping-api:latest registry.radartoolkit.com/mapping-api:latest
	docker push registry.radartoolkit.com/mapping-api:latest
	docker push registry.radartoolkit.com/mapping-api:$(VERSION)

	# Setup Shapes
	docker tag mapping-setup-shapes:$(VERSION) registry.radartoolkit.com/mapping-setup-shapes:$(VERSION)
	docker tag mapping-setup-shapes:latest registry.radartoolkit.com/mapping-setup-shapes:latest
	docker push registry.radartoolkit.com/mapping-setup-shapes:latest
	docker push registry.radartoolkit.com/mapping-setup-shapes:$(VERSION)


.PHONY: push-ingestor
push-ingestor: build-mlab-ingestor
	docker tag mlab-ingestor:$(VERSION) registry.radartoolkit.com/mlab-ingestor:$(VERSION)
	docker tag mlab-ingestor:latest registry.radartoolkit.com/mlab-ingestor:latest
	docker push registry.radartoolkit.com/mlab-ingestor:latest
	docker push registry.radartoolkit.com/mlab-ingestor:$(VERSION)


.PHONY: push-api-staging
push-api-staging: build build-setup-shapes
	docker tag mapping-api:$(VERSION) registry.staging.radartoolkit.com/mapping-api:$(VERSION)
	docker tag mapping-api:latest registry.staging.radartoolkit.com/mapping-api:latest
	docker push registry.staging.radartoolkit.com/mapping-api:latest
	docker push registry.staging.radartoolkit.com/mapping-api:$(VERSION)

	# Setup Shapes
	docker tag mapping-setup-shapes:$(VERSION) registry.staging.radartoolkit.com/mapping-setup-shapes:$(VERSION)
	docker tag mapping-setup-shapes:latest registry.staging.radartoolkit.com/mapping-setup-shapes:latest
	docker push registry.staging.radartoolkit.com/mapping-setup-shapes:latest
	docker push registry.staging.radartoolkit.com/mapping-setup-shapes:$(VERSION)


.PHONY: push-ingestor-staging
push-ingestor-staging: build-mlab-ingestor
	docker tag mlab-ingestor:$(VERSION) registry.staging.radartoolkit.com/mlab-ingestor:$(VERSION)
	docker tag mlab-ingestor:latest registry.staging.radartoolkit.com/mlab-ingestor:latest
	docker push registry.staging.radartoolkit.com/mlab-ingestor:latest
	docker push registry.staging.radartoolkit.com/mlab-ingestor:$(VERSION)


.PHONY: deploy-api-staging
deploy-api-staging: push-api-staging
	make -C ../../../radar-infra/deploy deploy STACK=mapping-api ENVIRONMENT=staging

.PHONY: deploy-api
deploy-api: push-api
	make -C ../../../radar-infra/deploy deploy STACK=mapping-api ENVIRONMENT=production



.PHONY: deploy-ingestor
deploy-ingestor: push-ingestor
	make -C ../../../radar-infra/deploy deploy STACK=mlab-ingestor ENVIRONMENT=production


.PHONY: deploy
deploy: push-api
	make -C ../../../radar-infra/deploy deploy STACK=mapping-api ENVIRONMENT=production
