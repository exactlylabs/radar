.PHONY: watchdog

export OS?=$(shell go env GOOS)
export ARCH?=$(shell go env GOARCH)
OUTPUT_DIR?=./dist
BIN_NAME?=radar_agent
PROVIDER_SIGNING_CERT_PATH?=./dist/certs/binCert.crt
PROVIDER_SIGNING_KEY_PATH?=./dist/certs/binKey.key
export VERSION?=DEV
export TAGS=""
INSTALL_DIR?=/usr/local/bin

# Get Absolute Path of Signing files
CERT_PATH=$(abspath ${PROVIDER_SIGNING_CERT_PATH})
KEY_PATH=$(abspath ${PROVIDER_SIGNING_KEY_PATH})
DIST_DIR=$(abspath ${OUTPUT_DIR})
OUTPUT_PATH=${DIST_DIR}/${BIN_NAME}

## Add .exe to BIN_NAME in case the target OS is Windows
ifeq ("${OS}", "windows")
  ifneq ("${BIN_NAME}", *.exe)
    BIN_NAME:=${BIN_NAME}.exe
  endif
endif

sign:
	@echo "Signing Binary"
	go run cmd/signing/main.go -bin ${OUTPUT_PATH} -key ${KEY_PATH} -cert ${CERT_PATH} -o ${OUTPUT_PATH}_signed
	@echo "Signed File generated at ${OUTPUT_PATH}_signed"

validate:
	@echo "Validating signed binary"
	go run cmd/validate/main.go -bin ${OUTPUT_PATH}_signed -o ${OUTPUT_PATH}_parsed
	@rm ${OUTPUT_PATH}_parsed
	@echo "Validating signed binary"

build:
	./scripts/build.sh \
		--output ${OUTPUT_PATH} \
		--os ${OS} \
		--arch ${ARCH} \
		${VERSION}

ookla_bin:
	./scripts/make_ookla.sh

watchdog:
	./scripts/build.sh \
		--output ${DIST_DIR}/watchdog \
		--os ${OS} \
		--arch ${ARCH} \
		--project cmd/start_watchdog/main.go \
		--tags ${TAGS} \
		${VERSION}

watchdog-dev: TAGS=development
watchdog-dev: watchdog

run:
	./scripts/dev.sh

run_watchdog:
	REFLEX_CONFIG_FILE='reflex.watchdog.config' ./scripts/dev.sh

# Setup Dev environment
dev: ookla_bin
	DEV=1 CERT_CONFIG=scripts/dev_root_ca.cnf ./scripts/gen_root_ca.sh
	DEV=1 CERT_CONFIG=scripts/dev_cert_ssl.cnf ./scripts/gen_cert.sh

install:
	mkdir -p ${DESTDIR}${INSTALL_DIR}
	cp ${OUTPUT_PATH} ${DESTDIR}${INSTALL_DIR}/radar-agent


deb:
	./scripts/build_deb.sh -o ${DIST_DIR} -a ${ARCH} ${VERSION}

rpm:
	./scripts/build_rpm.sh -o ${DIST_DIR} -a ${ARCH} ${VERSION}

pkg:
	./scripts/build_pkg.sh -o ${DIST_DIR} ${VERSION}

msi:
	./scripts/build_msi.sh -o ${DIST_DIR} ${VERSION}

floto-image:
	docker buildx build --platform linux/amd64,linux/arm64 -t exactlylabs/radar-floto-agent:latest -f docker/floto/Dockerfile --push .

all: build

clean:
	rm -f ${OUTPUT_PATH}
	rm -f ${OUTPUT_PATH}_signed
