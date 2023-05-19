#!/usr/bin/env bash

make build

ansible-playbook -i infra/ansible/inventory.yaml infra/ansible/playbooks/install_processor.yaml -e @infra/ansible/vars.yaml $@
