# Windows Installation

You may install the software either:

- as a desktop application using the pre-built installation wizard, or
- manually from source code

## Desktop Setup

In order to install the Decision Support UI as a desktop application, please download and run the latest Windows
installation wizard executable from the [releases page](https://github.com/CWWhitney/decision_ui/releases) on
GitHub (e.g., the file `decision-support-ui-X.X.X-setup.exe`).

![GitHub releases page](./github-releases-page.webp)

There a no additional requirements. The installation wizard will guide you through the installation process.

![Installation Wizard](./installation-wizard.webp)

Afterward, you can start the application by clicking on the corresponding desktop icon or start menu entry.

![Desktop Application](./desktop-application.webp)

### Uninstall

You can remove the application from the Windows settings page called `Apps & features` or `Add and Remove Programs`:

![Uninstall the Application](./uninstall-application.webp)

### Backup

You may create a backup of your data (user accounts and models) by copying the file `decision-support-ui.db`
from the directory `%APPDATA%\decision-support-ui`.

![Backup Database](./backup-database.webp)

> NOTE: Please keep in mind that this file is most likely not compatible with a different version of the application.

## Installation from Source

You may also install the decision support user interface from its source code. There are two main requirements:

- [Node.js](https://nodejs.org/) (tested with v24.14.1)
- [R](https://www.r-project.org/) (tested with v4.4.2)

### Install R and the decisionSupport package

You can use the batch script `code/frontend/bin/install-r.bat`. It will download and install R and the decisionSupport
CRAN package in the directory `code/frontend/resources/R`.

### Install Node.js

For Node.js, please follow the official [installation instructions](https://nodejs.org/en/download). During the setup,
make sure to select the option that the `node` and `npm` command is added to the `PATH` environment and available in
your terminal.

Afterward, install the JavaScript tool [`concurrently`](https://www.npmjs.com/package/concurrently) by executing the
following command in a terminal:

```
npm install -g concurrently
```

### Download Source Code and Install Dependencies

You may either download the source code as a Zip file and extract all files into a directory of your choice.

Otherwise, follow the official [installation instructions](https://git-scm.com/downloads/win) for
[Git](https://git-scm.com/) on Windows.

Download the source code from GitHub via Git by executing the following command in a terminal:

```
git clone https://github.com/CWWhitney/decision_ui.git
cd decision_ui
```

Install further software libraries (JavaScript libraries) by executing the Windows batch file
`bin/install.bat`.

### Build the application

You can build the application by running the Windows batch file `bin/build.bat`.

### Run the application

You can start the application by executing the Windows batch file `bin/run-webapp.bat`.
