#!/usr/bin/env bash

set -e

PORTS=$(psql -A -t $DATABASE_URL -c "select remote_gateway_port from clients where remote_gateway_port is not null")

for PORT in $PORTS
do
	set +e
	scp -o StrictHostKeyChecking=no -P $PORT $1 radar@localhost:~/update.sh
	sleep 2
	ssh -o BatchMode=yes -o StrictHostKeyChecking=no radar@localhost -p $PORT -f "chmod +x ~/update.sh" # > /dev/null 2>&1
	ssh -o BatchMode=yes -o StrictHostKeyChecking=no radar@localhost -p $PORT -f "~/update.sh" # > /dev/null 2>&1
	ssh -o BatchMode=yes -o StrictHostKeyChecking=no radar@localhost -p $PORT -f "rm update.sh" # > /dev/null 2>&1
	test $? -eq 0 && echo Updated $PORT
	set -e
done

