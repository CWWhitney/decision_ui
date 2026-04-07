#!/bin/bash

cd "$(dirname "$0")/../"

podman run \
    --rm -it \
    -v ./data:/root/workspace/code/server/data:Z \
    -p 8080:8080 \
    -e DSUI_ACCESS_TOKEN_SECRET=my_secret \
    -e DSUI_REFRESH_TOKEN_SECRET=my_secret \
    localhost/decision-support-ui/server:latest
