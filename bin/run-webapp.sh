#/bin/bash

cd "$(dirname "$0")/../"

concurrently -k -c auto -n server "bash code/server/bin/run.sh"

