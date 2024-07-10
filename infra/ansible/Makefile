ENVIRONMENT ?= staging

setup-vpn-router:
	@echo "Setting up VPN Router"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-vpn-router.yml -e @${ENVIRONMENT}_vars

setup-nfs:
	@echo "Setting up NFS Server"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-nfs-server.yml -e @${ENVIRONMENT}_vars

setup-swarm:
	@echo "Setting up Swarm Cluser"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-swarm.yml -e @${ENVIRONMENT}_vars

setup-postgres:
	@echo "Setting up Postgres"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-postgresql.yml -e @${ENVIRONMENT}_vars

setup-redis:
	@echo "Setting up Redis"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-redis.yml -e @${ENVIRONMENT}_vars

setup-clickhouse:
	@echo "Setting up Clickhouse"
	ansible-playbook -i inventory/${ENVIRONMENT}.yml playbooks/setup-clickhouse.yml -e @${ENVIRONMENT}_vars

setup: setup-nfs setup-swarm
