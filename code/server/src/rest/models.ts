import * as express from "express";
import { authenticateRoute } from "./authentication";

export const getRestApi = () => {
    const app = express();

    app.get("/models", authenticateRoute, (req, res) => {
        const userId = req.authenticatedUserId;
    });

    return app;
};
