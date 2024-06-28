VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

all: setup ingestor mapping-api

setup:
	go run cmd/setup_shapes/main.go

ingestor:
	go build -o mlab-ingestor cmd/ingestor_service/main.go

mapping-api:
	go build -o mapping-api cmd/server/main.go


build:
	docker buildx build \
	  --platform linux/arm64,linux/amd64 \
		-f docker/Dockerfile \
		-t mapping-api:$(VERSION) .

	docker tag mapping-api:$(VERSION) mapping-api:latest


build-setup-shapes:
	docker buildx build \
	  --platform linux/arm64,linux/amd64 \
		-f docker/Dockerfile.setup-shapes \
		-t mapping-setup-shapes:$(VERSION) .

	docker tag mapping-setup-shapes:$(VERSION) mapping-setup-shapes:latest

push: build build-setup-shapes
	docker tag mapping-api:$(VERSION) registry.radartoolkit.com/mapping-api:$(VERSION)
	docker tag mapping-api:latest registry.radartoolkit.com/mapping-api:latest
	docker tag mapping-setup-shapes:$(VERSION) registry.radartoolkit.com/mapping-setup-shapes:$(VERSION)
	docker tag mapping-setup-shapes:latest registry.radartoolkit.com/mapping-setup-shapes:latest
	docker push registry.radartoolkit.com/mapping-api:latest
	docker push registry.radartoolkit.com/mapping-api:$(VERSION)
	docker push registry.radartoolkit.com/mapping-setup-shapes:latest
	docker push registry.radartoolkit.com/mapping-setup-shapes:$(VERSION)


push-staging: build build-setup-shapes
	docker tag mapping-api:$(VERSION) registry.staging.radartoolkit.com/mapping-api:$(VERSION)
	docker tag mapping-api:latest registry.staging.radartoolkit.com/mapping-api:latest
	docker tag mapping-setup-shapes:$(VERSION) registry.staging.radartoolkit.com/mapping-setup-shapes:$(VERSION)
	docker tag mapping-setup-shapes:latest registry.staging.radartoolkit.com/mapping-setup-shapes:latest
	docker push registry.staging.radartoolkit.com/mapping-api:latest
	docker push registry.staging.radartoolkit.com/mapping-api:$(VERSION)
	docker push registry.staging.radartoolkit.com/mapping-setup-shapes:latest
	docker push registry.staging.radartoolkit.com/mapping-setup-shapes:$(VERSION)

deploy-staging: push-staging
	make -C ../../infra/deploy deploy STACK=mapping-api ENVIRONMENT=staging

deploy: push
	make -C ../../infra/deploy deploy STACK=mapping-api ENVIRONMENT=production
