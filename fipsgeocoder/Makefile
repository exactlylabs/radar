VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

OUTPUT_DIR?=dist
DESTDIR?=.
BIN_NAME?=fipsgeocoder


service:
	go build -o ${OUTPUT_DIR}/${BIN_NAME} cmd/start_server/main.go


run:
	go run cmd/start_server/main.go


.PHONY: build
build:
	./scripts/build_image.sh
	docker tag fipsgeocoder:$(VERSION) fipsgeocoder:latest

.PHONY: push-staging
push-staging: build
	docker tag fipsgeocoder:$(VERSION) registry.staging.radartoolkit.com/fipsgeocoder:$(VERSION)
	docker tag fipsgeocoder:latest registry.staging.radartoolkit.com/fipsgeocoder:latest
	docker push registry.staging.radartoolkit.com/fipsgeocoder:latest
	docker push registry.staging.radartoolkit.com/fipsgeocoder:$(VERSION)

.PHONY: push
push: build
	docker tag fipsgeocoder:$(VERSION) registry.radartoolkit.com/fipsgeocoder:$(VERSION)
	docker tag fipsgeocoder:latest registry.radartoolkit.com/fipsgeocoder:latest
	docker push registry.radartoolkit.com/fipsgeocoder:latest
	docker push registry.radartoolkit.com/fipsgeocoder:$(VERSION)

.PHONY: deploy-staging
deploy-staging: push-staging
	make -C ../infra/deploy deploy STACK=fipsgeocoder ENVIRONMENT=staging

.PHONY: deploy
deploy: push
	make -C ../infra/deploy deploy STACK=fipsgeocoder ENVIRONMENT=production
