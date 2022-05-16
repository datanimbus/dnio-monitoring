#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "data.stack:mon :: Building MON using TAG :: $TAG"
echo "****************************************************"


docker build -t data.stack.mon:$TAG .


echo "****************************************************"
echo "data.stack:mon :: MON Built using TAG :: $TAG"
echo "****************************************************"


echo $TAG > LATEST_MON