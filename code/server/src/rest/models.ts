import * as express from "express";
import { authenticateRoute } from "./authentication";
import { addModel, getModel, listModelsForUser, removeModel, updateModel } from "../state/queries";

const MAX_MODELS_PER_USER = 100;

export const getRestApi = () => {
    const app = express();

    // list all available models for a use
    app.get("/models", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const models = await listModelsForUser(userId);
        res.status(200).json(models);
    });

    // retrieve existing model of a user
    app.get("/model/:modelId", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const modelId = parseInt(req.params.modelId);

        const model = await getModel(userId);

        if (!model || model.userId != userId) {
            return res.status(400).json({ error: `model with id ${modelId} not found` });
        }

        res.status(200).json();
    });

    // add a new model for a user
    app.post("/model", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const { modelfile } = req.body;

        const models = await listModelsForUser(userId);
        if (models.length > MAX_MODELS_PER_USER) {
            return res.status(400).json({ error: `cannot store more than ${MAX_MODELS_PER_USER} models per user` });
        }

        const model = await addModel(userId, modelfile);

        res.send(200).json({ modelId: model.id });
    });

    // update an existing model of a user
    app.put("/model/:modelId", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const modelId = parseInt(req.params.modelId);
        const { modelfile } = req.body;

        const model = await getModel(modelId);

        if (!model || model.userId != userId) {
            return res.status(400).json({ error: `model with id ${modelId} not found` });
        }

        await updateModel(modelId, modelfile);

        res.sendStatus(200);
    });

    // delete an existing model of a user
    app.delete("/model/:modelId", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const modelId = parseInt(req.params.modelId);

        const model = await getModel(modelId);

        if (!model || model.userId != userId) {
            return res.status(400).json({ error: `model with id ${modelId} not found` });
        }

        await removeModel(modelId);

        res.sendStatus(200);
    });

    return app;
};
