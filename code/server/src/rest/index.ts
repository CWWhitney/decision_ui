import express from "express";
import { getAuthenticationApi } from "./authentication.js";
import { getModelsApi } from "./models.js";
import { getRApi } from "./r.js";

export const getRestApi = ({ rScriptPath }: { rScriptPath: string }) => {
    const app = express();

    app.use("/auth", getAuthenticationApi());
    app.use("/models", getModelsApi());
    app.use("/r", getRApi({ rScriptPath }));

    return app;
};
