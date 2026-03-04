import * as express from "express";

import { makeErrorResponseBody, validateSchema } from "@decision-support-ui/common";
import { Schema } from "ajv";

export const validateJsonBody = <T>(schema: Schema) => {
    const validate = validateSchema(schema);

    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const error = validate(req.body);

        if (error) {
            return res
                .status(400)
                .json(
                    makeErrorResponseBody(
                        `validation for path '${req.originalUrl}' and schema ` +
                            `'${(schema as any)?.title ?? "unknown schema"}' failed:\n\n${error}`
                    )
                );
        }

        next();
    };
};
