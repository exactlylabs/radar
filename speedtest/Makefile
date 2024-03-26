VERSION := $(shell date -u +"%Y%m%d%H%M%S")
export VERSION

.PHONY: build
build:
	docker buildx build --platform linux/arm64 -t speedtest-client:$(VERSION) .
	docker tag speedtest-client:$(VERSION) speedtest-client:latest

push-staging: build
	aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 339712956451.dkr.ecr.us-east-2.amazonaws.com
	docker tag speedtest-client:$(VERSION) 339712956451.dkr.ecr.us-east-2.amazonaws.com/speedtest-client:$(VERSION)
	docker tag speedtest-client:latest 339712956451.dkr.ecr.us-east-2.amazonaws.com/speedtest-client:latest
	docker push 339712956451.dkr.ecr.us-east-2.amazonaws.com/speedtest-client:latest
	docker push 339712956451.dkr.ecr.us-east-2.amazonaws.com/speedtest-client:$(VERSION)

deploy-staging: push-staging
	make -C ../infra/deploy deploy STACK=speedtest-client ENVIRONMENT=staging
