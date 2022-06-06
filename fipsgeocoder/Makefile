OUTPUT_DIR?=dist
DESTDIR?=.
BIN_NAME?=fipsgeocoder


service:
	go build -o ${OUTPUT_DIR}/${BIN_NAME} cmd/start_server/main.go


run:
	go run cmd/start_server/main.go