ENVIRONMENT ?= staging

setup-nfs:
	@echo "Setting up NFS Server"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-nfs-server.yml

setup-swarm:
	@echo "Setting up Swarm Cluser"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-swarm.yml


setup: setup-nfs setup-swarm
