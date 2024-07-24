VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

.PHONY: build
build:
	docker buildx build --build-arg METABASE_VERSION=latest --platform linux/arm64 -t metabase:$(VERSION) ./build
	docker tag metabase:$(VERSION) metabase:latest

push-staging: build
	docker tag metabase:$(VERSION) registry.staging.radartoolkit.com/metabase:$(VERSION)
	docker tag metabase:latest registry.staging.radartoolkit.com/metabase:latest
	docker push registry.staging.radartoolkit.com/metabase:latest
	docker push registry.staging.radartoolkit.com/metabase:$(VERSION)

push: build
	docker tag metabase:$(VERSION) registry.radartoolkit.com/metabase:$(VERSION)
	docker tag metabase:latest registry.radartoolkit.com/metabase:latest
	docker push registry.radartoolkit.com/metabase:latest
	docker push registry.radartoolkit.com/metabase:$(VERSION)

deploy-staging: push-staging
	make -C ../ deploy STACK=metabase ENVIRONMENT=staging

deploy: push
	make -C ../ deploy STACK=metabase ENVIRONMENT=production
