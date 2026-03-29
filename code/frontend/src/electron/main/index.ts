import * as path from "path";
import * as net from "net";

import { app, shell, BrowserWindow, ipcMain } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

import { startServer } from "@decision-support-ui/server";

/**
 * Returns a random free port to be used for the node server.
 *
 * Create a temporary server socket with the port "0", indicating that
 * the operating system should choose a random free port and immediately
 * stops the socket again.
 *
 * @returns port number
 */
const findPort = async (): Promise<number> => {
    return new Promise<number>(resolve => {
        const srv = net.createServer();
        srv.listen(0, () => {
            const port = (srv.address() as net.AddressInfo).port;
            srv.close(() => {
                resolve(port);
            });
        });
    });
};

/**
 * Returns the file path to the sqlite database file (considering the operating system file system layout).
 *
 * On Windows: %APPDATA%\decision-support-ui\decision-support-ui.db
 * On Linux: $XDG_CONFIG_HOME/decision-support-ui/decision-support-ui.db
 * On Mac: ~/Library/Application Support/decision-support-ui/decision-support-ui.db
 *
 * See: https://www.electronjs.org/docs/latest/api/app#appgetpathname
 *
 * @returns the file path to the sqlite database file
 */
const getDatabasePath = () => {
    return path.join(app.getPath("userData"), "decision-support-ui.db");
};

/**
 * Returns the file path to the Rscript executable.
 * 
 * On Windows: %APPDATA%\Local\Programs\decision-support-ui\resources\app.asar.unpacked\resources\R\bin\Rscript.exe
 * Otherwise: Rscript
 * @returns the filepath to the Rscript executable
 */
const getRscriptExecutablePath = () => {
    console.error(`__dirname is ${__dirname}`);
    console.error(`app.getPath('assets') is ${app.getPath("assets")}`);
    console.error(`process.resourcesPath is ${process.resourcesPath}`);
    if (process.platform == "win32") {
        app.getAppPath()
        return path.join(app.getPath("assets"), "resources/app.asar.unpacked/resources/R/bin/Rscript.exe");
    }
    return "Rscript";
}

/**
 * Create the electron window.
 *
 * @param backendPort the port for the backend REST api
 */
const createWindow = async (backendPort: number) => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "../preload/index.mjs"),
            sandbox: false
        }
    });

    ipcMain.handle("getBackendBaseURL", () => {
        return `http://127.0.0.1:${backendPort}`;
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler(details => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    }
};

/**
 * Run the electron app.
 */
const run = async () => {
    // simplify data directory to "decision-support-ui", which would otherwise default to "@decision-support-ui/frontend"
    app.setPath("userData", path.join(app.getPath("appData"), "decision-support-ui"));

    // start node server backend
    const backendPort = await findPort();
    const cleanupServer = await startServer({
        port: backendPort,
        databasePath: getDatabasePath(),
        rScriptPath: getRscriptExecutablePath(),
    });

    app.whenReady().then(() => {
        // Set app user model id for windows
        electronApp.setAppUserModelId("com.electron");

        // Default open or close DevTools by F12 in development
        // and ignore CommandOrControl + R in production.
        // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
        app.on("browser-window-created", (_, window) => {
            optimizer.watchWindowShortcuts(window);
        });

        createWindow(backendPort);

        app.on("activate", function () {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow(backendPort);
            }
        });
    });

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
            cleanupServer();
        }
    });

    app.on("quit", () => {
        cleanupServer();
    });
};

run();
