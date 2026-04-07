import express from "express";
import * as common from "@decision-support-ui/common";

import { authenticateRoute } from "./authentication.js";
import { validateJsonBody } from "./common.js";
import { logger } from "../logging.js";
import { generateAndExecuteResultHistogramScript } from "../r/result_histogram.js";
import { generateAndExecuteEvpiScript } from "../r/evpi.js";

export const getRApi = ({ rScriptPath }: { rScriptPath: string }) => {
    const app = express();

    // calculate result histogram by executing model in r
    app.post(
        "/calculate_result_histogram",
        authenticateRoute,
        validateJsonBody(common.CalculateResultHistogramRequestSchema),
        async (req, res) => {
            logger.info("calculate_result_histogram");
            const { graph, computation } = req.body as common.CalculateResultHistogramRequestBody;

            try {
                const responseData = await generateAndExecuteResultHistogramScript(graph, computation, rScriptPath);
                return res.status(200).json(responseData);
            } catch (e: any) {
                logger.error("unexpected error calculating result histogram", e);
                return res.status(500).json({
                    error: e.message
                } as common.ErrorResponseBody);
            }
        }
    );

    // calculate evpi by executing model in r
    app.post(
        "/calculate_evpi",
        authenticateRoute,
        validateJsonBody(common.CalculateEvpiRequestSchema),
        async (req, res) => {
            logger.info("calculate_evpi");
            const { graph, computation } = req.body as common.CalculateEvpiRequestBody;

            try {
                const responseData = await generateAndExecuteEvpiScript(graph, computation, rScriptPath);
                return res.status(200).json(responseData);
            } catch (e: any) {
                logger.error("unexpected error calculating evpi", e);
                return res.status(500).json({
                    error: e.message
                } as common.ErrorResponseBody);
            }
        }
    );

    return app;
};
