##
#
# Build scripts for the toolkit-website project
# To be able to build for multiple platforms, you may need to enable docker to use containerd
# -- see https://docs.docker.com/storage/containerd/
#
##
VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

SMTP_AUTH_USER ?= $(error SMTP_AUTH_USER is not set)
SMTP_AUTH_PASSWORD ?= $(error SMTP_AUTH_PASSWORD is not set)

ENVIRONMENT ?= staging

.PHONY: build
build:
	@echo "Building $(ENVIRONMENT) environment"

	docker buildx build \
		--platform linux/arm64,linux/amd64 \
		-t toolkit-website:$(VERSION) \
		--build-arg "ENVIRONMENT=$(ENVIRONMENT)" \
		--build-arg "SMTP_AUTH_USER=$(SMTP_AUTH_USER)" \
		--build-arg "SMTP_AUTH_PASSWORD=$(SMTP_AUTH_PASSWORD)" \
		-f docker/Dockerfile .

	docker tag toolkit-website:$(VERSION) toolkit-website:latest


.PHONY: push-staging
push-staging: ENVIRONMENT=staging
push-staging:	build
	@echo "Pushing staging environment"
	docker tag toolkit-website:$(VERSION) registry.staging.radartoolkit.com/toolkit-website:$(VERSION)
	docker tag toolkit-website:latest registry.staging.radartoolkit.com/toolkit-website:latest
	docker push registry.staging.radartoolkit.com/toolkit-website:latest
	docker push registry.staging.radartoolkit.com/toolkit-website:$(VERSION)

.PHONY: deploy-staging
deploy-staging: push-staging
	@echo "Deploying staging environment"
	make -C ../infra/deploy deploy STACK=toolkit-website ENVIRONMENT=staging
