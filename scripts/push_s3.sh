#!/bin/bash

set -e

TAG=`cat CURRENT_MON`

echo "****************************************************"
echo "datanimbus.io.mon :: Saving Image to AWS S3 :: $S3_BUCKET/stable-builds"
echo "****************************************************"

TODAY_FOLDER=`date ++%Y_%m_%d`

docker save -o datanimbus.io.mon_$TAG.tar datanimbus.io.mon:$TAG
bzip2 datanimbus.io.mon_$TAG.tar
aws s3 cp datanimbus.io.mon_$TAG.tar.bz2 s3://$S3_BUCKET/stable-builds/$TODAY_FOLDER/datanimbus.io.mon_$TAG.tar.bz2
rm datanimbus.io.mon_$TAG.tar.bz2

echo "****************************************************"
echo "datanimbus.io.mon :: Image Saved to AWS S3 AS datanimbus.io.mon_$TAG.tar.bz2"
echo "****************************************************"