#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "data.stack:mon :: Building MON using TAG :: $TAG"
echo "****************************************************"


if [ $cleanBuild ]; then
    docker build --no-cache -t data.stack.mon:$TAG .
else 
    docker build -t data.stack.mon:$TAG .
fi


echo "****************************************************"
echo "data.stack:mon :: MON Built using TAG :: $TAG"
echo "****************************************************"


echo $TAG > LATEST_MON