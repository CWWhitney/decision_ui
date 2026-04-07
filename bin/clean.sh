#/bin/bash

cd "$(dirname "$0")/../"

bash code/common/bin/clean.sh
bash code/frontend/bin/clean.sh
bash code/server/bin/clean.sh