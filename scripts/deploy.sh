#!/bin/bash

set -e

TAG=`cat CURRENT_MON`


echo "****************************************************"
echo "datanimbus.io.mon :: Deploying Image in K8S :: $NAMESPACE"
echo "****************************************************"

kubectl set image deployment/mon mon=$ECR_URL/datanimbus.io.mon:$TAG -n $NAMESPACE --record=true


echo "****************************************************"
echo "datanimbus.io.mon :: Image Deployed in K8S AS $ECR_URL/datanimbus.io.mon:$TAG"
echo "****************************************************"