import { parse } from "csv-parse";

import * as common from "@decision-support-ui/common";
import { executeRScript } from "./execute";
import { logger } from "../logging";
import { DSUI_R_MAX_RUNTIME } from "../environment";

export const generateAndExecuteResultHistogramScript = async (
    graph: common.Graph,
    computation: common.BackendComputationState,
    rScriptExecutablePath: string
) => {
    const resultVariables = common.getResultVariables(graph.nodes);

    const generateRScript = (estimatesCsvFilepath: string, resultsCsvFilepath: string) => {
        const fragment = common.getModelFunctionRCodeForGraph(graph);
        return common.getRCodeHistogramTemplate(
            fragment.code,
            resultVariables,
            estimatesCsvFilepath,
            resultsCsvFilepath,
            computation.mcRuns,
            computation.histogramBins
        );
    };

    const rows = common.generateEstimatesTableFromGraph(graph.nodes);
    const estimatesCsv = common.convertEstimatesToCSV(rows);
    const timeout = Math.min(DSUI_R_MAX_RUNTIME, computation.maxRuntime);

    const executionResult = await executeRScript(rScriptExecutablePath, generateRScript, estimatesCsv, timeout);

    return {
        data: executionResult.resultsCsv ? await parseResultHistogramCsv(executionResult.resultsCsv) : null,
        error: executionResult.error
    } as common.CalculateResultHistogramResponseBody;
};

export const parseResultHistogramCsv = async (csv: string) => {
    return new Promise<common.CalculateResultHistogramData>((resolve, reject) => {
        parse(
            csv,
            {
                skip_empty_lines: true,
                delimiter: ",",
                quote: '"',
                encoding: "utf8"
            },
            (err, records) => {
                if (err || records.length <= 1) {
                    return reject(err);
                }
                return resolve({
                    bins: records.slice(1).map(r => parseFloat(r[0])),
                    variables: records[0].slice(1),
                    counts: records.slice(1).map(r => r.slice(1).map(parseFloat))
                } as common.CalculateResultHistogramData);
            }
        );
    });
};
