export OS?=$(shell go env GOOS)
export ARCH?=$(shell go env GOARCH)
OUTPUT_DIR?=./dist
BIN_NAME?=radar_agent
PROVIDER_SIGNING_CERT_PATH?=./dist/certs/binCert.crt
PROVIDER_SIGNING_KEY_PATH?=./dist/certs/binKey.key
export VERSION?=DEV
INSTALL_DIR?=/usr/bin

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

run:
	./scripts/dev.sh

# Setup Dev environment
dev: ookla_bin
	CERT_CONFIG=scripts/dev_root_ca.cnf ./scripts/gen_root_ca.sh
	CERT_CONFIG=scripts/dev_cert_ssl.cnf ./scripts/gen_cert.sh

install:
	mkdir -p ${DESTDIR}${INSTALL_DIR}
	cp ${OUTPUT_PATH} ${DESTDIR}${INSTALL_DIR}/radar-agent


deb:
# Need to change the changelog version due dpkg-buildpackage looking at it for creating the version
# TODO: In the future it might be interesting to autocreate changelogs when tagged.
	sed -i 's/radar-agent (.*)/radar-agent \(${VERSION}-1\)/' packaging/debian/changelog
	cd packaging && ARCH=${ARCH} dpkg-buildpackage -b --no-sign -a${ARCH}

rpm:
	./scripts/build_rpm.sh

pkg:
	OUTPUT_DIR=${DIST_DIR} ./scripts/build_pkg.sh

all: build

clean:
	rm -f ${OUTPUT_PATH}
	rm -f ${OUTPUT_PATH}_signed
