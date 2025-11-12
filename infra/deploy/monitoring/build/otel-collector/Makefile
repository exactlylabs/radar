VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

.PHONY: build
build:
	docker build --platform linux/amd64 \
		-t registry.radartoolkit.com/otel-collector:$(VERSION) \
		-t registry.radartoolkit.com/otel-collector:latest \
		.

push: build
	docker push registry.radartoolkit.com/otel-collector:$(VERSION)
	docker push registry.radartoolkit.com/otel-collector:latest

