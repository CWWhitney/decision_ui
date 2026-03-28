import { logger } from "./logging";
import { startServer } from "./server";

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
