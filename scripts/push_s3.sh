#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "data.stack:mon :: Saving Image to AWS S3 :: $S3_BUCKET/stable-builds"
echo "****************************************************"

TODAY_FOLDER=`date ++%Y_%m_%d`

docker save -o data.stack.mon_$TAG.tar data.stack.mon:$TAG
bzip2 data.stack.mon_$TAG.tar
aws s3 cp data.stack.mon_$TAG.tar.bz2 s3://$S3_BUCKET/stable-builds/$TODAY_FOLDER/data.stack.mon_$TAG.tar.bz2
rm data.stack.mon_$TAG.tar.bz2

echo "****************************************************"
echo "data.stack:mon :: Image Saved to AWS S3 AS data.stack.mon_$TAG.tar.bz2"
echo "****************************************************"