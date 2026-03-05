import * as express from "express";
import { getAuthenticationApi } from "./authentication";
import { getModelsApi } from "./models";

export const getRestApi = () => {
    const app = express();

    app.use("/auth", getAuthenticationApi());
    app.use("/models", getModelsApi());

    return app;
};
