#!/usr/bin/env bash

set -e

#PORTS=$(psql -A -t $DATABASE_URL -c "select remote_gateway_port from clients where remote_gateway_port is not null")
PORTS=33021

for PORT in $PORTS
do
	set +e
	sleep 2
	scp -o BatchMode=yes -o StrictHostKeyChecking=no -P $PORT ping.sh radar@localhost:~/ping.sh
	sleep 2
	scp -o BatchMode=yes -o StrictHostKeyChecking=no -P $PORT radarping.service radar@localhost:~/radarping.service
	sleep 2
	scp -o BatchMode=yes -o StrictHostKeyChecking=no -P $PORT update.sh radar@localhost:~/update.sh
	sleep 2
	ssh -o BatchMode=yes -o StrictHostKeyChecking=no radar@localhost -p $PORT -f "chmod +x ~/update.sh" # > /dev/null 2>&1
	sleep 2
	ssh -o BatchMode=yes -o StrictHostKeyChecking=no radar@localhost -p $PORT -f "~/update.sh" # > /dev/null 2>&1
	sleep 2
	ssh -o BatchMode=yes -o StrictHostKeyChecking=no radar@localhost -p $PORT -f "rm update.sh" # > /dev/null 2>&1
	test $? -eq 0 && echo Updated $PORT
	set -e
done

