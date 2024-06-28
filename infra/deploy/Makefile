ENVIRONMENT?=staging

ifeq ($(ENVIRONMENT), staging)
DOCKER_HOST?=ssh://admin@manager-01.staging.radartoolkit.com
else
DOCKER_HOST?=ssh://admin@manager-01.radartoolkit.com
endif

export DOCKER_HOST

.PHONY: deploy
deploy:
	echo "Deploying $(STACK) to $(ENVIRONMENT) environment in $(DOCKER_HOST)"

	docker stack deploy --resolve-image always -c ./$(STACK)/docker-compose.$(ENVIRONMENT).yml $(STACK)

