#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "data.stack:mon :: Pushing Image to Docker Hub :: appveen/data.stack.mon:$TAG"
echo "****************************************************"

docker tag data.stack.mon:$TAG appveen/data.stack.mon:$TAG
docker push appveen/data.stack.mon:$TAG

echo "****************************************************"
echo "data.stack:mon :: Image Pushed to Docker Hub AS appveen/data.stack.mon:$TAG"
echo "****************************************************"