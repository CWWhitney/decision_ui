import * as express from "express";
import * as common from "@decision-support-ui/common";

import { authenticateRoute } from "./authentication";
import { addModel, getModel, listModelsForUser, removeModel, updateModel } from "../state/queries";
import { validateJsonBody } from "./common";

const MAX_MODELS_PER_USER = 100;

export const getModelsApi = () => {
    const app = express();

    // list all available models for a use
    app.get("/for_user", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const models = await listModelsForUser(userId);
        res.status(200).json({ models } as common.ListModelsResponseBody);
    });

    // retrieve existing model of a user
    app.get("/model/:modelId", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const modelId = parseInt(req.params.modelId);
        const model = await getModel(modelId);

        if (!model || model.userId != userId) {
            return res.status(404).json({ error: `model with id ${modelId} not found` });
        }

        res.status(200).json({
            id: model.id,
            modelfile: common.migrateModelFile(JSON.parse(model.file) as common.ModelFileState)
        } as common.GetModelResponseBody);
    });

    // add a new model for a user
    app.post("/model", authenticateRoute, validateJsonBody(common.AddModelRequestSchema), async (req, res) => {
        const userId = req.authenticatedUserId;
        const { modelfile } = req.body as common.AddModelRequestBody;

        const models = await listModelsForUser(userId);
        if (models.length > MAX_MODELS_PER_USER) {
            return res.status(403).json({ error: `cannot store more than ${MAX_MODELS_PER_USER} models per user` });
        }

        const model = await addModel(userId, modelfile);

        res.status(200).json({ modelId: model.id });
    });

    // update an existing model of a user
    app.put("/model/:modelId", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const modelId = parseInt(req.params.modelId);
        const { modelfile } = req.body;

        const model = await getModel(modelId);

        if (!model || model.userId != userId) {
            return res.status(404).json({ error: `model with id ${modelId} not found` });
        }

        await updateModel(modelId, modelfile);

        res.status(200).json({});
    });

    // delete an existing model of a user
    app.delete("/model/:modelId", authenticateRoute, async (req, res) => {
        const userId = req.authenticatedUserId;
        const modelId = parseInt(req.params.modelId);

        const model = await getModel(modelId);

        if (!model || model.userId != userId) {
            return res.status(404).json({ error: `model with id ${modelId} not found` });
        }

        await removeModel(modelId);

        res.status(200).json({});
    });

    return app;
};
