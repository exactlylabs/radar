VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION
ENVIRONMENT ?= staging

.PHONY: build
build:
	@echo "Building $(ENVIRONMENT) environment"
	docker buildx build --provenance=false \
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
# A multi-platform build can't be loaded into the local daemon, so the image is
# pushed straight from the builder (the old tag-then-push never pushed anything).
push: ENVIRONMENT=prod
push:
	docker buildx build --provenance=false \
	-f docker/Dockerfile \
	--platform linux/arm64,linux/amd64 \
	--build-arg "ENVIRONMENT=$(ENVIRONMENT)" \
	-t registry.radartoolkit.com/mapping-client:$(VERSION) \
	-t registry.radartoolkit.com/mapping-client:latest \
	--push .

deploy-staging: push-staging
	make -C ../../../radar-infra/deploy deploy STACK=mapping-client ENVIRONMENT=staging

deploy: push
	make -C ../../../radar-infra/deploy deploy STACK=mapping-client ENVIRONMENT=production
