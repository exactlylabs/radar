VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

.PHONY : setup build

all: setup build

clean:
	rm -rf input
	rm mlab-processor

setup:
	./scripts/download_asn_maps.sh
	./scripts/download_shapes.sh


build:
	docker buildx build \
	  --platform linux/arm64,linux/amd64 \
		-f docker/Dockerfile \
		-t mlab-processor:$(VERSION) .

	docker tag mlab-processor:$(VERSION) mlab-processor:latest


.PHONY: push-staging
push-staging: build
	docker tag mlab-processor:$(VERSION) registry.staging.radartoolkit.com/mlab-processor:$(VERSION)
	docker tag mlab-processor:latest registry.staging.radartoolkit.com/mlab-processor:latest
	docker push registry.staging.radartoolkit.com/mlab-processor:latest
	docker push registry.staging.radartoolkit.com/mlab-processor:$(VERSION)


.PHONY: push
push: build
	docker tag mlab-processor:$(VERSION) registry.radartoolkit.com/mlab-processor:$(VERSION)
	docker tag mlab-processor:latest registry.radartoolkit.com/mlab-processor:latest
	docker push registry.radartoolkit.com/mlab-processor:latest
	docker push registry.radartoolkit.com/mlab-processor:$(VERSION)


.PHONY: deploy-staging
deploy-staging: push-staging
	make -C ../infra/deploy deploy STACK=mlab-processor ENVIRONMENT=staging


.PHONY: deploy
deploy: push
	make -C ../infra/deploy deploy STACK=mlab-processor ENVIRONMENT=production
