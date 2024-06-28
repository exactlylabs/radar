VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION
ENVIRONMENT ?= staging

.PHONY: build
build:
	@echo "Building $(ENVIRONMENT) environment"
	docker buildx build \
	-f docker/Dockerfile \
	--platform linux/arm64,linux/amd64 \
	--build-arg "ENVIRONMENT=$(ENVIRONMENT)" \
	-t mapping-client:$(VERSION) .

	docker tag mapping-client:$(VERSION) mapping-client:latest

.PHONY: push-staging
push-staging: ENVIRONMENT=staging
push-staging: build
	docker tag mapping-client:$(VERSION) registry.staging.radartoolkit.com/mapping-client:$(VERSION)
	docker tag mapping-client:latest registry.staging.radartoolkit.com/mapping-client:latest
	docker push registry.staging.radartoolkit.com/mapping-client:latest
	docker push registry.staging.radartoolkit.com/mapping-client:$(VERSION)


.PHONY: push
push: ENVIRONMENT=production
push: build
	docker tag mapping-client:$(VERSION) registry.radartoolkit.com/mapping-client:$(VERSION)
	docker tag mapping-client:latest registry.radartoolkit.com/mapping-client:latest
	docker push registry.radartoolkit.com/mapping-client:latest
	docker push registry.radartoolkit.com/mapping-client:$(VERSION)

deploy-staging: push-staging
	make -C ../../infra/deploy deploy STACK=mapping-client ENVIRONMENT=staging

deploy: push
	make -C ../../infra/deploy deploy STACK=mapping-client ENVIRONMENT=production
