import * as express from "express";
import { getAuthenticationApi } from "./authentication";
import { getModelsApi } from "./models";
import { getRApi } from "./r";
import { Sequelize } from "sequelize";

export const getRestApi = () => {
    const app = express();

    app.use("/auth", getAuthenticationApi());
    app.use("/models", getModelsApi());
    app.use("/r", getRApi());

    return app;
};
