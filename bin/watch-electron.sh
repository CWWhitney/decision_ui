#/bin/bash

cd "$(dirname "$0")/../"

concurrently -k -c auto -n common,server,electron "bash code/common/bin/watch.sh" "bash code/server/bin/watch.sh" "bash code/frontend/bin/watch-electron.sh"

