#!/bin/bash

cd "$(dirname "$0")/../"

# clean dist directory
rm -rf dist
mkdir dist

npm run build:electron:linux