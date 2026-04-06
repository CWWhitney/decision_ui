import { Op } from "sequelize";
import { ModelTable, UserTable } from "./database";
import { ModelFileState, ListModelsEntry } from "@decision-support-ui/common";

export const findUserByUsername = async (username: string) => {
    return await UserTable.findOne({
        where: {
            username: {
                [Op.eq]: username
            }
        }
    });
};

export const addUser = async (username: string, password: string) => {
    return await UserTable.create({ username, password });
};

export const listModelsForUser = async (userId: number, limit = 100): Promise<ListModelsEntry[]> => {
    return (
        await ModelTable.findAll({
            attributes: {
                exclude: ["file", "userId"]
            },
            where: {
                userId: {
                    [Op.eq]: userId
                }
            },
            order: [["updatedAt", "DESC"]],
            limit
        })
    ).map(
        model =>
            ({
                id: model.id,
                name: model.name,
                description: model.description,
                createdAt: model.createdAt.toUTCString(),
                updatedAt: model.updatedAt.toUTCString()
            }) as ListModelsEntry
    );
};

export const getModel = async (modelId: number) => {
    return await ModelTable.findOne({
        where: {
            id: {
                [Op.eq]: modelId
            }
        }
    });
};

export const addModel = async (userId: number, modelfile: ModelFileState) => {
    return await ModelTable.create({
        userId,
        name: modelfile.metadata.name,
        description: modelfile.metadata.description,
        file: JSON.stringify(modelfile)
    });
};

export const updateModel = async (modelId: number, modelfile: ModelFileState) => {
    return await ModelTable.update(
        {
            name: modelfile.metadata.name,
            description: modelfile.metadata.description,
            file: JSON.stringify(modelfile)
        },
        {
            where: {
                id: modelId
            }
        }
    );
};

export const removeModel = async (modelId: number) => {
    return await ModelTable.destroy({
        where: {
            id: {
                [Op.eq]: modelId
            }
        }
    });
};
