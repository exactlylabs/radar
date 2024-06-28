VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION
ENVIRONMENT ?= staging

.PHONY: build
build:
	docker buildx build \
		--platform linux/arm64,linux/amd64 \
		--build-arg "ENVIRONMENT=$(ENVIRONMENT)" \
		-t speedtest-client:$(VERSION) .

	docker tag speedtest-client:$(VERSION) speedtest-client:latest

.PHONY: push-staging
push-staging: ENVIRONMENT=staging
push-staging: build
	docker tag speedtest-client:$(VERSION) registry.staging.radartoolkit.com/speedtest-client:$(VERSION)
	docker tag speedtest-client:latest registry.staging.radartoolkit.com/speedtest-client:latest
	docker push registry.staging.radartoolkit.com/speedtest-client:latest
	docker push registry.staging.radartoolkit.com/speedtest-client:$(VERSION)

deploy-staging: push-staging
	make -C ../infra/deploy deploy STACK=speedtest-client ENVIRONMENT=staging
