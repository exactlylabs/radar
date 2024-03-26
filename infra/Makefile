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

setup-nfs:
	make -C ./ansible setup-nfs ENVIRONMENT=$(ENVIRONMENT)

setup-swarm:
	make -C ./ansible setup-swarm ENVIRONMENT=$(ENVIRONMENT)
