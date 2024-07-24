VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

.PHONY: build
build:
	docker buildx build --platform=linux/arm64,linux/amd64  -t pods-server:$(VERSION) .
	docker tag pods-server:$(VERSION) pods-server:latest


.PHONY: push-staging
push-staging: build
	docker tag pods-server:$(VERSION) registry.staging.radartoolkit.com/pods-server:$(VERSION)
	docker tag pods-server:latest registry.staging.radartoolkit.com/pods-server:latest
	docker push registry.staging.radartoolkit.com/pods-server:latest
	docker push registry.staging.radartoolkit.com/pods-server:$(VERSION)


.PHONY: deploy-staging
deploy-staging: push-staging
	make -C ../infra/deploy deploy STACK=pods-server ENVIRONMENT=staging


.PHONY: push
push: build
	docker tag pods-server:$(VERSION) registry.radartoolkit.com/pods-server:$(VERSION)
	docker tag pods-server:latest registry.radartoolkit.com/pods-server:latest
	docker push registry.radartoolkit.com/pods-server:latest
	docker push registry.radartoolkit.com/pods-server:$(VERSION)


.PHONY: deploy
deploy: push
	make -C ../infra/deploy deploy STACK=pods-server ENVIRONMENT=production
