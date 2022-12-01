#!/usr/bin/env bash

ansible-playbook -i infra/ansible/inventory.yaml infra/ansible/playbooks/install_input_files.yaml -e @infra/ansible/vars.yaml $@