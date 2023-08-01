#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "datanimbus.io.mon :: Cleaning Up Local Images :: $TAG"
echo "****************************************************"


docker rmi datanimbus.io.mon:$TAG -f