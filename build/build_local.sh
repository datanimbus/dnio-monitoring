#!/bin/bash

pm2 stop 00-mon || true
pm2 start build/pm2_local.yaml
