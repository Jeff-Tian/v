#!/bin/sh

if [ -n "$1" ]; then
    PORT=$1
fi

if [ -n "$2" ]; then
    APP_NAME=$2
fi

if [ -n "$3" ]; then
    SERVICE_FARM=$3
fi

if [ -n "$4" ]; then
    theme=$4
fi

if [ -z "$PORT" ]; then
    echo "port no set"
    exit 1
fi

if [ -z "$APP_NAME" ]; then
    echo "app name not set"
    exit 1
fi

if [ -z "$SERVICE_FARM" ]; then
    echo "service farm not set"
    exit 1
fi

if [ -z "$theme" ]; then
    echo "theme not set, will default to 'hcd'"
fi

################################
#     START PM2 INSTANCE	   #
################################
if [ -n "$PORT" ]; then
	echo "Listening on port: $PORT"
	export PORT
fi

if [ -n "$SERVICE_FARM" ]; then
    echo "Working on farm: $SERVICE_FARM"
    export SERVICE_FARM
fi

if [ -n "$theme" ]; then
    echo "theme is: $theme"
    export theme
fi

#export NODE_ENV

CURRENT_PATH=`dirname $0`
pm2 start "./app.js" --name "$APP_NAME"
exit $?