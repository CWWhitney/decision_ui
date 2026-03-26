import { parse } from "csv-parse";

import * as common from "@decision-support-ui/common";
import { executeRScript } from "./execute";

export const generateAndExecuteResultHistogramScript = async (
    graph: common.Graph,
    computation: common.BackendComputationState
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

    const executionResult = await executeRScript(generateRScript, estimatesCsv);

    const data = await parseResultHistogramCsv(executionResult.resultsCsv);

    return {
        data,
        execution: executionResult.execution
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
                if (err) {
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
