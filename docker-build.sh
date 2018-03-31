#!/bin/sh

set -e

CONTAINER=volunteers-nowhere	# <-- Name your container
TAG=latest									# <-- Tag for your container
REGISTRY=pietropietro								# <-- If you use other then github repo
BUILD_DIR=${PWD}/../output			# <-- This is where meteor build your files.
											#     Folder will be created and after build will be deleted

echo "Start building container ${CONTAINER} ..."

# clean old build if exist
rm -rf $BUILD_DIR

# install node packages

# build meteor app
mkdir -p $BUILD_DIR/.build
meteor npm install --production
meteor build --directory ${BUILD_DIR}/.build --server-only

# pull fresh base image:
docker pull pietropietro/alpine-meteor:latest

cp Dockerfile .dockerignore ${BUILD_DIR}
# build container
docker build --no-cache --rm -t ${CONTAINER}:${TAG} ${BUILD_DIR}

# create tag on container
if [ $REGISTRY ]; then
	docker tag ${CONTAINER}:${TAG} ${REGISTRY}/${CONTAINER}:${TAG}
else
	docker tag ${CONTAINER}:${TAG} ${CONTAINER}:${TAG}
fi

# push to our registry
if [ $REGISTRY ]; then
	docker push ${REGISTRY}/${CONTAINER}:${TAG}
else
	docker push ${CONTAINER}:${TAG}
fi

# clean images if needed
# docker rmi -f ${CONTAINER}:${TAG} ${REGISTRY}/${CONTAINER}:${TAG} martinezko/alpine-meteor:latest

# to run your container
# docker run -d ${REGISTRY}/${CONTAINER}:${TAG}
# OR use docker-compose.yaml file
# docker-compose up -d

# clean build folder
rm -rf ${BUILD_DIR}

echo "End build of container ${CONTAINER} ..."
