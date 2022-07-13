.PHONY : setup build

all: setup build

clean: 
	rm -rf input
	rm mlab-processor

build:
	go build -o ./mlab-processor cmd/processor/main.go

setup:
	./scripts/download_asn_maps.sh
	./scripts/download_shapes.sh

install:
	cp mlab-processor /usr/local/bin
	cp scripts/mlab-processor.service /etc/systemd/system/
	systemctl daemon-reload
	systemctl enable mlab-processor
	systemctl start mlab-processor

run:
	./scripts/dev.sh