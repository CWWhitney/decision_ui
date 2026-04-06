import * as path from "path";
import express from "express";
import compress from "compression";
import * as http from "http";
import nocache from "nocache";

import { fileURLToPath } from "url";
import { dirname } from "path";

import { logger } from "./logging.js";
import { getRestApi } from "./rest/index.js";
import { loadDatabase } from "./state/database.js";
import { DSUI_DATABASE_PATH, DSUI_R_SCRIPT_PATH } from "./constants.js";

export const startServer = async ({
    port = 8080,
    databasePath = DSUI_DATABASE_PATH,
    rScriptPath = DSUI_R_SCRIPT_PATH
}: {
    port?: number;
    databasePath?: string;
    rScriptPath?: string;
    corsOrigins?: string[];
    corsMethods?: string[];
    corsHeaders?: string[];
} = {}) => {
    logger.info("starting web server");

    await loadDatabase(databasePath);

    // setup express
    const app = express();
    const httpServer = http.createServer(app);

    // enable compression
    app.use(compress());

    // disable caching
    app.use(nocache());
    app.set("etag", false);

    // enable json parsing
    app.use(express.json());

    app.use("/api", getRestApi({ rScriptPath }));

    // serve static files
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pathToStatic = path.join(__dirname, "../../../frontend/dist/webapp");
    logger.info(`serving from ${pathToStatic}`);
    app.use(express.static(pathToStatic, { etag: false }));

    const serverHandle = httpServer.listen(port, () => {
        logger.info(`listening on http://localhost:${port}/`);
    });

    const cleanup = async () => {
        if (serverHandle) {
            logger.info("stop web server");
            serverHandle.close();
        }
    };

    return cleanup;
};
