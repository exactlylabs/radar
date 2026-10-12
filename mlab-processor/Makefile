VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

.PHONY : setup build binaries test

# Static linux/amd64 binaries for /opt/broadbandmapping on mapping-db:
# bin/mlab-processor (one-shot/timer or -loop) and bin/process-mlab (manual CLI).
binaries:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o bin/mlab-processor ./cmd/processor
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -o bin/process-mlab ./cmd/process

test:
	go vet ./...
	go test ./...

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


.PHONY: push
push: build
	docker tag mlab-processor:$(VERSION) registry.radartoolkit.com/mlab-processor:$(VERSION)
	docker tag mlab-processor:latest registry.radartoolkit.com/mlab-processor:latest
	docker push registry.radartoolkit.com/mlab-processor:latest
	docker push registry.radartoolkit.com/mlab-processor:$(VERSION)


.PHONY: deploy
deploy: push
	make -C ../../radar-infra/deploy deploy STACK=mlab-processor ENVIRONMENT=production
