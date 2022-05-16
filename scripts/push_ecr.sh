#!/bin/bash

set -e

TAG=`cat CURRENT_MON`


echo "****************************************************"
echo "data.stack:mon :: Pushing Image to ECR :: $ECR_URL/data.stack.mon:$TAG"
echo "****************************************************"

$(aws ecr get-login --no-include-email)
docker tag data.stack.mon:$TAG $ECR_URL/data.stack.mon:$TAG
docker push $ECR_URL/data.stack.mon:$TAG


echo "****************************************************"
echo "data.stack:mon :: Image pushed to ECR AS $ECR_URL/data.stack.mon:$TAG"
echo "****************************************************"