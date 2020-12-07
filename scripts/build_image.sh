#!/bin/bash
set -e
if [ -f $WORKSPACE/../TOGGLE ]; then
    echo "****************************************************"
    echo "data.stack:mon :: Toggle mode is on, terminating build"
    echo "data.stack:mon :: BUILD CANCLED"
    echo "****************************************************"
    exit 0
fi

cDate=`date +%Y.%m.%d.%H.%M` #Current date and time

if [ -f $WORKSPACE/../CICD ]; then
    CICD=`cat $WORKSPACE/../CICD`
fi
if [ -f $WORKSPACE/../DATA_STACK_RELEASE ]; then
    REL=`cat $WORKSPACE/../DATA_STACK_RELEASE`
fi
if [ -f $WORKSPACE/../DOCKER_REGISTRY ]; then
    DOCKER_REG=`cat $WORKSPACE/../DOCKER_REGISTRY`
fi
BRANCH='dev'
if [ -f $WORKSPACE/../BRANCH ]; then
    BRANCH=`cat $WORKSPACE/../BRANCH`
fi
if [ $1 ]; then
    REL=$1
fi
if [ ! $REL ]; then
    echo "****************************************************"
    echo "data.stack:mon :: Please Create file DATA_STACK_RELEASE with the releaese at $WORKSPACE or provide it as 1st argument of this script."
    echo "data.stack:mon :: BUILD FAILED"
    echo "****************************************************"
    exit 0
fi
TAG=$REL
if [ $2 ]; then
    TAG=$TAG"-"$2
fi
if [ $3 ]; then
    BRANCH=$3
fi
if [ $CICD ]; then
    echo "****************************************************"
    echo "data.stack:mon :: CICI env found"
    echo "****************************************************"
    TAG=$TAG"_"$cDate
    if [ ! -f $WORKSPACE/../DATA_STACK_NAMESPACE ]; then
        echo "****************************************************"
        echo "data.stack:mon :: Please Create file DATA_STACK_NAMESPACE with the namespace at $WORKSPACE"
        echo "data.stack:mon :: BUILD FAILED"
        echo "****************************************************"
        exit 0
    fi
    DATA_STACK_NS=`cat $WORKSPACE/../DATA_STACK_NAMESPACE`
fi

sh $WORKSPACE/scripts/prepare_yaml.sh $REL $2

echo "****************************************************"
echo "data.stack:mon :: Using build :: "$TAG
echo "****************************************************"

cd $WORKSPACE

echo "****************************************************"
echo "data.stack:mon :: Adding IMAGE_TAG in Dockerfile :: "$TAG
echo "****************************************************"
sed -i.bak s#__image_tag__#$TAG# Dockerfile

if [ -f $WORKSPACE/../CLEAN_BUILD_MON ]; then
    echo "****************************************************"
    echo "data.stack:mon :: Doing a clean build"
    echo "****************************************************"
    
    docker build --no-cache -t data.stack:mon.$TAG .
    rm $WORKSPACE/../CLEAN_BUILD_MON

    echo "****************************************************"
    echo "data.stack:mon :: Copying deployment files"
    echo "****************************************************"

    if [ $CICD ]; then
        sed -i.bak s#__docker_registry_server__#$DOCKER_REG# mon.yaml
        sed -i.bak s/__release_tag__/"'$REL'"/ mon.yaml
        sed -i.bak s#__release__#$TAG# mon.yaml
        sed -i.bak s#__namespace__#$DATA_STACK_NS# mon.yaml
        sed -i.bak '/imagePullSecrets/d' mon.yaml
        sed -i.bak '/- name: regsecret/d' mon.yaml

        kubectl delete deploy mon -n $DATA_STACK_NS || true # deleting old deployement
        kubectl delete service mon -n $DATA_STACK_NS || true # deleting old service
        #creating monw deployment
        kubectl create -f mon.yaml
    fi

else
    echo "****************************************************"
    echo "data.stack:mon :: Doing a normal build"
    echo "****************************************************"
    docker build -t data.stack:mon.$TAG .
    if [ $CICD ]; then
        kubectl set image deployment/mon mon=data.stack:mon.$TAG -n $DATA_STACK_NS --record=true
    fi
fi
if [ $DOCKER_REG ]; then
    echo "****************************************************"
    echo "data.stack:mon :: Docker Registry found, pushing image"
    echo "****************************************************"

    docker tag data.stack:mon.$TAG $DOCKER_REG/data.stack:mon.$TAG
    docker push $DOCKER_REG/data.stack:mon.$TAG
fi
echo "****************************************************"
echo "data.stack:mon :: BUILD SUCCESS :: data.stack:mon.$TAG"
echo "****************************************************"
echo $TAG > $WORKSPACE/../LATEST_MON
