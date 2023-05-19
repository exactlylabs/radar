FROM metabase/metabase:v0.42.4

RUN apk update
RUN apk add --no-cache socat

COPY startup.sh startup.sh
RUN chmod +x startup.sh

ENTRYPOINT ["./startup.sh"]
