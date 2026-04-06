import * as express from "express";
import { getAuthenticationApi } from "./authentication";
import { getModelsApi } from "./models";
import { getRApi } from "./r";

export const getRestApi = ({ rScriptPath }: { rScriptPath: string }) => {
    const app = express();

    app.use("/auth", getAuthenticationApi());
    app.use("/models", getModelsApi());
    app.use("/r", getRApi({ rScriptPath }));

    return app;
};
