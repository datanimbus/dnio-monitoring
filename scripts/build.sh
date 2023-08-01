#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "datanimbus.io.mon :: Building MON using TAG :: $TAG"
echo "****************************************************"

sed -i.bak s#__image_tag__#$TAG# Dockerfile

if $cleanBuild ; then
    docker build --no-cache -t datanimbus.io.mon:$TAG .
else 
    docker build -t datanimbus.io.mon:$TAG .
fi


echo "****************************************************"
echo "datanimbus.io.mon :: MON Built using TAG :: $TAG"
echo "****************************************************"


echo $TAG > LATEST_MON