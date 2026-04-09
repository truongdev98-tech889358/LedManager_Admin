#!/bin/sh
# Build and run docker compose for airticket-fe

docker compose down --remove-orphans

docker compose build

docker compose up -d
