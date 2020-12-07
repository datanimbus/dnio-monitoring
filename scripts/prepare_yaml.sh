#!/bin/bash

echo "****************************************************"
echo "data.stack:mon :: Copying yaml file "
echo "****************************************************"
if [ ! -d $WORKSPACE/../yamlFiles ]; then
    mkdir $WORKSPACE/../yamlFiles
fi

REL=$1
if [ $2 ]; then
    REL=$REL-$2
fi

rm -rf $WORKSPACE/../yamlFiles/mon.*
cp $WORKSPACE/mon.yaml $WORKSPACE/../yamlFiles/mon.$REL.yaml
cd $WORKSPACE/../yamlFiles/
echo "****************************************************"
echo "data.stack:mon :: Preparing yaml file "
echo "****************************************************"
sed -i.bak s/__release_tag__/"'$1'"/ mon.$REL.yaml
sed -i.bak s/__release__/$REL/ mon.$REL.yaml