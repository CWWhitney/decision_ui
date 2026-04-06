import { logger } from "./logging.js";
import { startServer } from "./server.js";

const run = async () => {
    const cleanup = await startServer();

    const exitHandler = async (signal: string) => {
        logger.info(`shutdown via ${signal}`);
        await cleanup();
        process.kill(process.pid, signal);
    };

    ["SIGUSR2", "SIGINT", "SIGTERM", "SIGHUP"].forEach(signal => process.once(signal, exitHandler));
};

run();
