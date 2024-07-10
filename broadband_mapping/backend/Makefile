VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

all: setup ingestor mapping-api


.PHONY: setup
setup:
	go run cmd/setup_shapes/main.go


.PHONY: ingestor
ingestor:
	go build -o mlab-ingestor cmd/ingestor_service/main.go


.PHONY: mapping-api
mapping-api:
	go build -o mapping-api cmd/server/main.go


.PHONY: build
build:
	docker buildx build \
	  --platform linux/arm64,linux/amd64 \
		-f docker/Dockerfile \
		-t mapping-api:$(VERSION) .

	docker tag mapping-api:$(VERSION) mapping-api:latest


.PHONY: build-setup-shapes
build-setup-shapes:
	docker buildx build \
	  --platform linux/arm64,linux/amd64 \
		-f docker/Dockerfile.setup-shapes \
		-t mapping-setup-shapes:$(VERSION) .

	docker tag mapping-setup-shapes:$(VERSION) mapping-setup-shapes:latest


.PHONY: build-mlab-ingestor
build-mlab-ingestor:
	docker buildx build \
	  --platform linux/arm64,linux/amd64 \
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
push-api-staging: build
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
	make -C ../../infra/deploy deploy STACK=mapping-api ENVIRONMENT=staging


.PHONY: deploy-ingestor-staging
deploy-ingestor-staging: push-ingestor-staging
	make -C ../../infra/deploy deploy STACK=mlab-ingestor ENVIRONMENT=staging


.PHONY: deploy
deploy: push
	make -C ../../infra/deploy deploy STACK=mapping-api ENVIRONMENT=production
