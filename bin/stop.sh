#!/bin/sh

if [ -n "$1" ]; then
    APP_NAME=$1
fi

if [ -z "$APP_NAME" ]; then
    echo "app name not set"
    echo "default to 'BuzzAdmin'"
    APP_NAME="BuzzAdmin"
fi

echo "$APP_NAME"

################################
#      STOP PM2 INSTANCE	   #
################################
pm2 stop "$APP_NAME"