#!/bin/bash

set -e

cDate=`date +%Y.%m.%d.%H.%M`



TAG=$RELEASE"_"$cDate
if [ $tag == 'dev' || $tag == 'main' || $tag == 'vNext' ]; then

    echo "****************************************************"
    echo "data.stack:mon :: Default Tag Found, Creating new TAG :: $TAG"
    echo "****************************************************"

    echo $TAG > CURRENT_MON

else
    echo "****************************************************"
    echo "data.stack:mon :: User's Tag Found :: $tag"
    echo "****************************************************"

    echo $tag > CURRENT_MON
fi