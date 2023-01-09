#!/bin/bash

set -e

echo "****************************************************"
echo "data.stack:mon :: Copying yaml file "
echo "****************************************************"
if [ ! -d yamlFiles ]; then
    mkdir yamlFiles
fi

TAG=`cat CURRENT_MON`

rm -rf yamlFiles/mon.*
cp mon.yaml yamlFiles/mon.$TAG.yaml
cd yamlFiles/
echo "****************************************************"
echo "data.stack:mon :: Preparing yaml file "
echo "****************************************************"

sed -i.bak s/__release__/$TAG/ mon.$TAG.yaml

echo "****************************************************"
echo "data.stack:mon :: yaml file saved"
echo "****************************************************"