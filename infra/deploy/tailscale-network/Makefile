VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION


.PHONY: build
build:
	docker buildx build --platform linux/arm64,linux/amd64 -t tailscale:$(VERSION) ./build
	docker tag tailscale:$(VERSION) tailscale:latest

push-staging: build
	docker tag tailscale:$(VERSION) registry.staging.radartoolkit.com/tailscale:$(VERSION)
	docker tag tailscale:latest registry.staging.radartoolkit.com/tailscale:latest
	docker push registry.staging.radartoolkit.com/tailscale:latest
	docker push registry.staging.radartoolkit.com/tailscale:$(VERSION)

