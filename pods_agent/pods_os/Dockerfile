FROM tianon/qemu:7.2-bullseye

WORKDIR /app

RUN apt update && apt install -y curl python3 python3-pip git tcpdump netcat iproute2 arping

COPY requirements.txt .
COPY scripts/test_setup.sh .

RUN ./test_setup.sh


