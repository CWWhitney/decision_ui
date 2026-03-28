#/bin/bash

# run both frontend and server in watch mode (auto-restart on code changes)
# uses node package "concurrently", run "npm install -g concurrently" to install it

cd "$(dirname "$0")/../"

concurrently -k -c auto -n common,frontend,server "bash code/common/bin/watch.sh" "bash code/frontend/bin/watch-webapp.sh" "bash code/server/bin/watch.sh"