#!/bin/bash

set -e

TAG=`cat CURRENT_MON`


echo "****************************************************"
echo "datanimbus.io.mon :: Pushing Image to ECR :: $ECR_URL/datanimbus.io.mon:$TAG"
echo "****************************************************"

$(aws ecr get-login --no-include-email)
docker tag datanimbus.io.mon:$TAG $ECR_URL/datanimbus.io.mon:$TAG
docker push $ECR_URL/datanimbus.io.mon:$TAG


echo "****************************************************"
echo "datanimbus.io.mon :: Image pushed to ECR AS $ECR_URL/datanimbus.io.mon:$TAG"
echo "****************************************************"