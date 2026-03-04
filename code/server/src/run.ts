import * as path from "path";
import * as express from "express";
import * as compress from "compression";
import * as http from "http";
import * as nocache from "nocache";

import { logger } from "./logging";
import { getRestApi } from "./rest";

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

// enable html form data parsing
app.use(express.urlencoded({ extended: true }));

app.use("/api", getRestApi());

// serve static files
const pathToStatic = path.join(__dirname, "../../../frontend/dist/webapp");
logger.info(`serving from ${pathToStatic}`);
app.use(express.static(pathToStatic, { etag: false }));

const serverHandle = httpServer.listen(8080, () => {
    logger.info("listening on http://localhost:8080/");
});

const cleanup = async () => {
    if (serverHandle) {
        logger.info("stop web server");
        serverHandle.close();
    }
};

const exitHandler = async (signal: string) => {
    logger.info(`shutdown via ${signal}`);
    await cleanup();
    process.kill(process.pid, signal);
};

["SIGUSR2", "SIGINT", "SIGTERM", "SIGHUP"].forEach(signal => process.once(signal, exitHandler));
