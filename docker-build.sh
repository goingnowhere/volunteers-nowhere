#!/bin/sh

# Exit on errors
set -e

CONTAINER=volunteers-nowhere
# TODO automate this and add optional version letters from args (e.g. 2019-04-08b)
TAG=2022-01-06
REGISTRY=piemonkey

FULL_NAME=${CONTAINER}:${TAG}

echo "Start building ${FULL_NAME} ..."

# build container
docker build -t ${FULL_NAME} .

# create tag and push
docker tag ${FULL_NAME} ${REGISTRY}/${FULL_NAME}
docker push ${REGISTRY}/${FULL_NAME}

echo "Build complete"
