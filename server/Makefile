VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

build:
	docker buildx build --secret=type=env,id=MAXMIND_KEY --platform=linux/arm64  -t pods-server:$(VERSION) .
	docker tag pods-server:$(VERSION) pods-server:latest

push-staging: build
	docker tag pods-server:$(VERSION) registry.staging.radartoolkit.com/pods-server:$(VERSION)
	docker tag pods-server:latest registry.staging.radartoolkit.com/pods-server:latest
	docker push registry.staging.radartoolkit.com/pods-server:latest
	docker push registry.staging.radartoolkit.com/pods-server:$(VERSION)
