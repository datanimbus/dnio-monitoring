#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "datanimbus.io.mon :: Pushing Image to Docker Hub :: appveen/datanimbus.io.mon:$TAG"
echo "****************************************************"

docker tag datanimbus.io.mon:$TAG appveen/datanimbus.io.mon:$TAG
docker push appveen/datanimbus.io.mon:$TAG

echo "****************************************************"
echo "datanimbus.io.mon :: Image Pushed to Docker Hub AS appveen/datanimbus.io.mon:$TAG"
echo "****************************************************"