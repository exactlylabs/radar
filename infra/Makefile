ENVIRONMENT?=staging

.PHONY: deploy-swarmpit
deploy-swarmpit:
	make -C ./deploy deploy STACK=swarmpit ENVIRONMENT=$(ENVIRONMENT)

.PHONY: deploy-traefik
deploy-traefik:
	make -C ./deploy deploy STACK=traefik ENVIRONMENT=$(ENVIRONMENT)

.PHONY: deploy-vector
deploy-vector:
	make -C ./deploy deploy STACK=vector ENVIRONMENT=$(ENVIRONMENT)

.PHONY: deploy-otel-collector
deploy-otel-collector:
	make -C ./deploy deploy STACK=otel-collector ENVIRONMENT=$(ENVIRONMENT)

.PHONY: setup-vpn-router
setup-vpn-router:
	make -C ./ansible setup-vpn-router ENVIRONMENT=$(ENVIRONMENT)

.PHONY: setup-nfs
setup-nfs:
	make -C ./ansible setup-nfs ENVIRONMENT=$(ENVIRONMENT)

.PHONY: setup-swarm
setup-swarm:
	make -C ./ansible setup-swarm ENVIRONMENT=$(ENVIRONMENT)

.PHONY: setup-postgres
setup-postgres:
	make -C ./ansible setup-postgres ENVIRONMENT=$(ENVIRONMENT)

.PHONY: setup-redis
setup-redis:
	make -C ./ansible setup-redis ENVIRONMENT=$(ENVIRONMENT)
