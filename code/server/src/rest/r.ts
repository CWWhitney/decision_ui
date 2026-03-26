import * as express from "express";
import * as common from "@decision-support-ui/common";

import { authenticateRoute } from "./authentication";
import { validateJsonBody } from "./common";
import { logger } from "../logging";
import { runInNewContext } from "vm";
import { executeRScript } from "../r/execute";
import { generateAndExecuteResultHistogramScript } from "../r/result_histogram";

export const getRApi = () => {
    const app = express();

    // calculate result histogram execute model in r
    app.post(
        "/calculate_result_histogram",
        authenticateRoute,
        validateJsonBody(common.CalculateResultHistogramRequestSchema),
        async (req, res) => {
            logger.info("calculate_result_histogram");
            const { graph, computation } = req.body as common.CalculateResultHistogramRequestBody;

            try {
                const responseData = await generateAndExecuteResultHistogramScript(graph, computation);
                return res.status(200).json(responseData);
            } catch (e) {
                return res.status(500).json({
                    error: e.message
                } as common.ErrorResponseBody);
            }
        }
    );

    return app;
};
