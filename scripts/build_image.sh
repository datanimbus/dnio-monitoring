#!/bin/bash
set -e
if [ -f $WORKSPACE/../TOGGLE ]; then
    echo "****************************************************"
    echo "datanimbus.io.mon :: Toggle mode is on, terminating build"
    echo "datanimbus.io.mon :: BUILD CANCLED"
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
    echo "datanimbus.io.mon :: Please Create file DATA_STACK_RELEASE with the releaese at $WORKSPACE or provide it as 1st argument of this script."
    echo "datanimbus.io.mon :: BUILD FAILED"
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
    echo "datanimbus.io.mon :: CICI env found"
    echo "****************************************************"
    TAG=$TAG"_"$cDate
    if [ ! -f $WORKSPACE/../DATA_STACK_NAMESPACE ]; then
        echo "****************************************************"
        echo "datanimbus.io.mon :: Please Create file DATA_STACK_NAMESPACE with the namespace at $WORKSPACE"
        echo "datanimbus.io.mon :: BUILD FAILED"
        echo "****************************************************"
        exit 0
    fi
    DATA_STACK_NS=`cat $WORKSPACE/../DATA_STACK_NAMESPACE`
fi

sh $WORKSPACE/scripts/prepare_yaml.sh $REL $2

echo "****************************************************"
echo "datanimbus.io.mon :: Using build :: "$TAG
echo "****************************************************"

cd $WORKSPACE

echo "****************************************************"
echo "datanimbus.io.mon :: Adding IMAGE_TAG in Dockerfile :: "$TAG
echo "****************************************************"
sed -i.bak s#__image_tag__#$TAG# Dockerfile

if [ -f $WORKSPACE/../CLEAN_BUILD_MON ]; then
    echo "****************************************************"
    echo "datanimbus.io.mon :: Doing a clean build"
    echo "****************************************************"
    
    docker build --no-cache -t datanimbus.io.mon:$TAG .
    rm $WORKSPACE/../CLEAN_BUILD_MON

    echo "****************************************************"
    echo "datanimbus.io.mon :: Copying deployment files"
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
    echo "datanimbus.io.mon :: Doing a normal build"
    echo "****************************************************"
    docker build -t datanimbus.io.mon:$TAG .
    if [ $CICD ]; then
        if [ $DOCKER_REG ]; then
            kubectl set image deployment/mon mon=$DOCKER_REG/datanimbus.io.mon:$TAG -n $DATA_STACK_NS --record=true
        else 
            kubectl set image deployment/mon mon=datanimbus.io.mon:$TAG -n $DATA_STACK_NS --record=true
        fi
    fi
fi
if [ $DOCKER_REG ]; then
    echo "****************************************************"
    echo "datanimbus.io.mon :: Docker Registry found, pushing image"
    echo "****************************************************"

    docker tag datanimbus.io.mon:$TAG $DOCKER_REG/datanimbus.io.mon:$TAG
    docker push $DOCKER_REG/datanimbus.io.mon:$TAG
fi
echo "****************************************************"
echo "datanimbus.io.mon :: BUILD SUCCESS :: datanimbus.io.mon:$TAG"
echo "****************************************************"
echo $TAG > $WORKSPACE/../LATEST_MON
