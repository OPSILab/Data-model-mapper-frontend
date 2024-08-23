#!/bin/bash

docker compose build --no-cache
docker compose up

# docker compose up --build
#docker buildx prune
#docker image prune
