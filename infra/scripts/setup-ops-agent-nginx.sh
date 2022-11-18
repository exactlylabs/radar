#!/usr/bin/env bash

# Configures Ops Agent to collect telemetry from the app and restart Ops Agent.

set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

DEFAULT_CONFIG=${SCRIPT_DIR}/../google-cloud-agent/config.yml
AGENT_CONFIG=${AGENT_CONFIG:-${DEFAULT_CONFIG}}

# Create a back up of the existing file so existing configurations are not lost.
sudo cp /etc/google-cloud-ops-agent/config.yaml /etc/google-cloud-ops-agent/config.yaml.bak

# Configure the Ops Agent.
cat ${AGENT_CONFIG} | sudo tee /etc/google-cloud-ops-agent/config.yaml > /dev/null

sudo service google-cloud-ops-agent restart
sleep 60