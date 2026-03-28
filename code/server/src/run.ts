import { logger } from "./logging";
import { startServer } from "./server";

const cleanup = startServer(8080, null, ["http://localhost:5173"]);

const exitHandler = async (signal: string) => {
    logger.info(`shutdown via ${signal}`);
    await cleanup();
    process.kill(process.pid, signal);
};

["SIGUSR2", "SIGINT", "SIGTERM", "SIGHUP"].forEach(signal => process.once(signal, exitHandler));
