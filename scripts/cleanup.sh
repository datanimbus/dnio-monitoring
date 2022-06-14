#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "data.stack:mon :: Cleaning Up Local Images :: $TAG"
echo "****************************************************"


docker rmi data.stack.mon:$TAG -f