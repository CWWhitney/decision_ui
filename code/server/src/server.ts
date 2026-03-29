import * as path from "path";
import * as express from "express";
import * as compress from "compression";
import * as http from "http";
import * as nocache from "nocache";
import * as cors from "cors";

import { logger } from "./logging";
import { getRestApi } from "./rest";
import { loadDatabase } from "./state/database";
import { DSUI_CORS_HEADERS, DSUI_CORS_METHODS, DSUI_CORS_ORIGINS, DSUI_DATABASE_PATH, DSUI_R_SCRIPT_PATH } from "./environment";

export const startServer = async ({
    port = 8080,
    databasePath = DSUI_DATABASE_PATH,
    rScriptPath = DSUI_R_SCRIPT_PATH,
    corsOrigins = DSUI_CORS_ORIGINS.split(","),
    corsMethods = DSUI_CORS_METHODS.split(","),
    corsHeaders = DSUI_CORS_HEADERS.split(",")
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

    // enable cors protected
    if (corsOrigins.includes("*")) {
        logger.warn("CORS is disabled via wildcard origin '*', please set correct origin with environment variable DSUI_CORS_ORIGINS!");
    }
    app.use(
        cors({
            origin: corsOrigins,
            methods: corsMethods,
            allowedHeaders: corsHeaders
        })
    );

    app.use("/api", getRestApi({ rScriptPath }));

    // serve static files
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
