#!/bin/bash

set -e

TAG=`cat CURRENT_MON`


echo "****************************************************"
echo "data.stack:mon :: Deploying Image in K8S :: $NAMESPACE"
echo "****************************************************"

kubectl set image deployment/mon mon=$ECR_URL/data.stack.mon:$TAG -n $NAMESPACE --record=true


echo "****************************************************"
echo "data.stack:mon :: Image Deployed in K8S AS $ECR_URL/data.stack.mon:$TAG"
echo "****************************************************"