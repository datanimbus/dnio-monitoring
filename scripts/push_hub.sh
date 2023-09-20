#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "datanimbus.io.mon :: Pushing Image to Docker Hub :: datanimbus/datanimbus.io.mon:$TAG"
echo "****************************************************"

docker tag datanimbus.io.mon:$TAG datanimbus/datanimbus.io.mon:$TAG
docker push datanimbus/datanimbus.io.mon:$TAG

echo "****************************************************"
echo "datanimbus.io.mon :: Image Pushed to Docker Hub AS datanimbus/datanimbus.io.mon:$TAG"
echo "****************************************************"