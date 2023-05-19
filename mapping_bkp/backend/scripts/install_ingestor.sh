#!/usr/bin/env bash

# This script expects you to have a vars.yml file at infra directory
# You can use infra/vars.template.yml as a template for it

ansible-playbook -i infra/inventory.yaml infra/playbooks/install_ingestor.yaml -e @infra/vars.yml
