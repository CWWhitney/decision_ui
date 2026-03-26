import { mkdtempSync, readFileSync, rmdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { exec } from "child_process";
import { DSUI_R_SCRIPT_PATH, DSUI_R_MAX_RUNTIME } from "../environment";
import { logger } from "../logging";
import * as common from "@decision-support-ui/common";

interface RExecutionCsvResult {
    resultsCsv: string;
    execution: common.RExecutionState;
}

const asyncExecuteR = async (rScriptFilepath: string, resultsCsvFilepath: string) => {
    return new Promise<RExecutionCsvResult>(resolve => {
        exec(
            `${DSUI_R_SCRIPT_PATH} ${rScriptFilepath}`,
            { timeout: DSUI_R_MAX_RUNTIME * 1000 },
            (error, stdout, stderr) => {
                if (error) {
                    return resolve({
                        resultsCsv: null,
                        execution: { stdout, stderr, exitcode: error.code }
                    });
                }

                const resultsCsv = readFileSync(resultsCsvFilepath, "utf-8");

                return resolve({
                    resultsCsv,
                    execution: { stdout, stderr, exitcode: 0 }
                });
            }
        );
    });
};

export const executeRScript = async (
    generateRScript: (estimatesCsvFilepath: string, resultsCsvFilepath: string) => string,
    estimates_csv: string
): Promise<RExecutionCsvResult> => {
    logger.debug(`execute Rscript`);
    let directory: string | null = null;
    let rScriptFilepath: string | null = null;
    let estimatesCsvFilepath: string | null = null;
    let resultsCsvFilepath: string | null = null;

    try {
        directory = mkdtempSync(join(tmpdir(), "dsui-"), { encoding: "utf-8" });
        logger.debug(`write files to temporary directory ${directory}`);

        rScriptFilepath = join(directory, "script.R");
        estimatesCsvFilepath = join(directory, "estimates.csv");
        resultsCsvFilepath = join(directory, "results.csv");

        const rScript = generateRScript(estimatesCsvFilepath, resultsCsvFilepath);

        writeFileSync(rScriptFilepath, rScript, { encoding: "utf-8", flush: true });
        writeFileSync(estimatesCsvFilepath, estimates_csv, { encoding: "utf-8", flush: true });

        return await asyncExecuteR(rScriptFilepath, resultsCsvFilepath);
    } finally {
        if (rScriptFilepath) {
            rmSync(rScriptFilepath, { force: true });
        }
        if (estimatesCsvFilepath) {
            rmSync(estimatesCsvFilepath, { force: true });
        }
        if (resultsCsvFilepath) {
            rmSync(resultsCsvFilepath, { force: true });
        }
        if (directory) {
            logger.debug(`remove temporary directory ${directory}`);
            rmdirSync(directory, {});
        }
    }
};
