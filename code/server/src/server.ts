import * as path from "path";
import * as express from "express";
import * as compress from "compression";
import * as http from "http";
import * as nocache from "nocache";
import * as cors from "cors";

import { logger } from "./logging";
import { getRestApi } from "./rest";

export const startServer = (port: number, databasePath: string = null, corsOrigins: string[] = []) => {
    logger.info("starting web server");

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
    app.use(
        cors({
            origin: corsOrigins,
            credentials: true
        })
    );

    app.use("/api", getRestApi());

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
