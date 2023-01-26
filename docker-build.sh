#!/bin/sh

# Exit on errors
set -e

CONTAINER=volunteers-nowhere
DATE=$(date +%Y-%m-%d)
if [[ "$1" ]]; then
  TAG=$DATE-$1
else
  TAG=$DATE
fi
REGISTRY=piemonkey

FULL_NAME=$CONTAINER:$TAG

if docker image inspect $FULL_NAME 1>/dev/null 2>/dev/null; then
  echo "Image $FULL_NAME already exists! aborting"
  echo "Specify a suffix using ./docker-build.sh suffix to build $FULL_NAME-suffix"
  exit 1
fi

echo "Start building $FULL_NAME ..."

# build container
docker build -t $FULL_NAME -t $REGISTRY/$FULL_NAME .

# push to docker hub
docker push $REGISTRY/$FULL_NAME

echo "Build complete"
