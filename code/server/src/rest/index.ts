import * as express from "express";
import { getAuthenticationApi } from "./authentication";

export const getRestApi = () => {
    const app = express();

    app.use("/auth", getAuthenticationApi());

    return app;
};
