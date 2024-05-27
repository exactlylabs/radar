ENVIRONMENT ?= staging

setup-vpn-router:
	@echo "Setting up VPN Router"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-vpn-router.yml

setup-nfs:
	@echo "Setting up NFS Server"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-nfs-server.yml

setup-swarm:
	@echo "Setting up Swarm Cluser"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-swarm.yml

setup-postgres:
	@echo "Setting up Postgres"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-postgresql.yml

setup: setup-nfs setup-swarm
