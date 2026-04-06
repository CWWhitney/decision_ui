# Developer Guide

This document provides general information and notes for developers for each supported operating system.

## Linux Development

### Development Environment

For development on Linux, we recommend using the development container image provided in the `deployment/development/src` directory in combination with [Visual Studio Code](https://code.visualstudio.com/) and the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

The container provides all required development dependencies, including an R installation and Node.js.

You can build and run the development container using [Podman](https://podman.io/) and the bash scripts in the `deployment/development/bin` directory:

- `build.sh` - build the container image
- `up.sh` - starts the container in background mode
- `shell_server.sh` - starts an interactive shell inside the container
- `down.sh` - stops the container

Inside the container, you can use various build scripts from the `bin` directory to start developing:

- `build.sh` - build the webapp in production mode
- `clean.sh` - remove all runtime files (cache, dependencies, etc.)
- `install.sh` - install software dependencies (python packages, node modules)
- `lint.sh` - check source code style
- `package-electron.sh` - package electron app for Linux as AppImage (without R)
- `test.sh` - run unit tests
- `run-webapp.sh` - run webapp in production mode
- `watch-webapp.sh` - run webapp in development and watch for files changes

### Linux Distribution & Packaging

On Linux, there is no self-contained pre-built version of R that can be packaged alongside an electron app. Because of that, the easiest way to distribute the application is with a Docker image.

## Windows Development

### Development Environment

For development on Linux, we recommend installing PytNode.js manually.

Afterward, you can use various batch scripts from the `bin` directory to start developing:

- `build.bat` - build the webapp in production mode
- `clean.bat` - remove all runtime files (cache, dependencies, etc.)
- `install.bat` - install software dependencies (R, python packages, node modules)
- `lint.bat` - check source code style
- `package-electron.bat` - package electron app for Windows as setup executable
- `run-webapp.bat` - run webapp in production mode
- `watch-webapp.bat` - run webapp in development and watch for files changes

### Windows Distribution & Packaging

On Windows, it is possible to distribute a pre-built version of R alongside the electron app. The `install.bat` batch file will download R and run the setup wizard in silent mode to install R in the directory `code/frontend/resources/R`. All files of the R installation seem to run independently and do not require any further setup or configuration. When packaging the electron app, the R directory is simply copied. When the electron app is installed by a user, the R directory is simply extracted and ready to go.

## MacOS Development

### Development Environment

For development on MacOS, we suggest installing [Podman](https://podman.io/) and following the Linux development recommendations.

### MacOS Distribution & Packaging

On MacOS, there is no self-contained pre-built version of R that can be packaged alongside an electron app. Because of that, the easiest way to distribute the application is with a Docker image, same as in Linux.

## Environment Variables

The following environment variables will be considered when running the server:

- `DSUI_LOG_LEVEL` \
  log level, show debug messages by providing `DEBUG` (default `INFO`)
- `DSUI_DATABASE_PATH` \
  path to the SQLite database file (default `./data/decision-support-ui.db`)
- `DSUI_R_SCRIPT_PATH` \
  path to the `Rscript` command or `Rscript.exe` binary (default `Rscript`)
- `DSUI_ACCESS_TOKEN_SECRET` \
  a unique secret to encrypt login information (insecure default value is `default`)
- `DSUI_ACCESS_TOKEN_EXPIRY` \
  the maximum lifetime of the access token (default `5m`)
- `DSUI_REFRESH_TOKEN_SECRET` \
  a unique secret to encrypt login information (insecure default value is `default`)
- `DSUI_REFRESH_TOKEN_EXPIRY` \
  the maximum lifetime of the refresh token (default `24h`)
- `DSUI_R_MAX_RUNTIME` \
  maximum runtime of R script in seconds (default `30` seconds)
- `DSUI_R_MAX_MCRUNS` \
  maximum number of Monte Carlo runs that are allowed to run in the backend (default `100000`)
- `DSUI_R_MAX_HISTOGRAM_BINS` \
  maximum number of histogram bins that can be generated in the backend (default `200`)
- `DSUI_BEARER_HEADER` \
  the HTTP header that is used to transmit the access token (default `Authorization`)
