import { parse } from "csv-parse";

import * as common from "@decision-support-ui/common";
import { executeRScript } from "./execute";
import { DSUI_R_MAX_MCRUNS, DSUI_R_MAX_RUNTIME } from "../constants";

export const generateAndExecuteEvpiScript = async (
    graph: common.Graph,
    computation: common.BackendEvpiComputationState,
    rScriptExecutablePath: string
) => {
    const resultVariables = common.getResultVariables(graph.nodes);

    const generateRScript = (estimatesCsvFilepath: string, resultsCsvFilepath: string) => {
        const fragment = common.getModelFunctionRCodeForGraph(graph);
        return common.getRCodeEvpiTemplate(
            fragment.code,
            resultVariables,
            estimatesCsvFilepath,
            resultsCsvFilepath,
            Math.min(DSUI_R_MAX_MCRUNS, computation.mcRuns)
        );
    };

    const rows = common.generateEstimatesTableFromGraph(graph.nodes);
    const estimatesCsv = common.convertEstimatesToCSV(rows);
    const timeout = Math.min(DSUI_R_MAX_RUNTIME, computation.maxRuntime);

    const executionResult = await executeRScript(rScriptExecutablePath, generateRScript, estimatesCsv, timeout);

    return {
        data: executionResult.resultsCsv ? await parseEvpiCsv(executionResult.resultsCsv) : null,
        error: executionResult.error
    } as common.CalculateEvpiResponseBody;
};

export const parseEvpiCsv = async (csv: string) => {
    return new Promise<common.CalculateEvpiData>((resolve, reject) => {
        parse(
            csv,
            {
                skip_empty_lines: true,
                delimiter: ",",
                quote: '"',
                encoding: "utf8"
            },
            (err, records) => {
                if (err) {
                    return reject(err);
                }
                if (records.length == 0) {
                    return reject("evpi csv contains nothing");
                }
                if (records.length == 1) {
                    return reject("evpi csv contains only header");
                }
                if (records[0].length <= 1) {
                    return reject("evpi csv contains no result variables");
                }

                const resultVariables = records[0].slice(1);
                const estimateVariables = records.slice(1).map(r => r[0]);

                return resolve(
                    Object.fromEntries(
                        estimateVariables.map((estimateVariable, estimateVariableIdx) => [
                            estimateVariable,
                            Object.fromEntries(
                                resultVariables.map((resultVariable, resultVariableIdx) => [
                                    resultVariable,
                                    parseFloat(records[estimateVariableIdx + 1][resultVariableIdx + 1])
                                ])
                            )
                        ])
                    ) as common.CalculateEvpiData
                );
            }
        );
    });
};
