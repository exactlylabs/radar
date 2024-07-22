VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

.PHONY: build
build:
	docker buildx build --platform linux/arm64 -t otel-collector:$(VERSION) ./build
	docker tag otel-collector:$(VERSION) otel-collector:latest

push-staging: build
	docker tag otel-collector:$(VERSION) registry.staging.radartoolkit.com/otel-collector:$(VERSION)
	docker tag otel-collector:latest registry.staging.radartoolkit.com/otel-collector:latest
	docker push registry.staging.radartoolkit.com/otel-collector:latest
	docker push registry.staging.radartoolkit.com/otel-collector:$(VERSION)

push: build
	docker tag otel-collector:$(VERSION) registry.radartoolkit.com/otel-collector:$(VERSION)
	docker tag otel-collector:latest registry.radartoolkit.com/otel-collector:latest
	docker push registry.radartoolkit.com/otel-collector:latest
	docker push registry.radartoolkit.com/otel-collector:$(VERSION)

deploy-staging: push-staging
	make -C ../ deploy STACK=otel-collector ENVIRONMENT=staging

deploy: push
	make -C ../ deploy STACK=otel-collector ENVIRONMENT=production
