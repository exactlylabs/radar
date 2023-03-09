.PHONY: agent

# Exported Variables
export OS?=linux
export ARCH?=amd64
export OUTPUT_DIR?=./dist
export BIN_NAME?=radar_agent

# Non Exported Variables
export RADAR_URL?=http://127.0.0.1:3000
OUTPUT_DIR:=$(abspath ${OUTPUT_DIR})
DIST_NAME=$(OS)-$(ARCH)

# Validations

## Add .exe to BIN_NAME in case the target OS is Windows
ifeq ("${OS}", "windows")
  ifneq ("${BIN_NAME}", *.exe)
    BIN_NAME:=${BIN_NAME}.exe
  endif
endif

# Targets

client_version:
	./scripts/create_version.sh

agent:
	$(MAKE) -C pods_agent all
	$(MAKE) -C pods_agent sign
	$(MAKE) -C pods_agent validate

watchdog:
	$(MAKE) -C pods_agent watchdog ARCH=arm64 OS=linux
	$(MAKE) -C pods_agent sign BIN_NAME=watchdog
	$(MAKE) -C pods_agent validate BIN_NAME=watchdog

upload_distribution:
	./scripts/upload_distribution.sh ${VERSION} ${OUTPUT_DIR}/${BIN_NAME} ${DIST_NAME}

upload_package:
	./scripts/upload_package.sh ${VERSION} ${FILE_PATH} ${OS} ${ARCH}

agent_distribution: agent upload_distribution

run:
	./scripts/run.sh

clean:
	$(MAKE) -C pods_agent clean
