import { Op } from "sequelize";
import { ModelTable, UserTable } from "./database";

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

export const getModelsByUser = async (userId: number) => {
    return await ModelTable.findAll({
        where: {
            userId: {
                [Op.eq]: userId
            }
        },
        order: ["updatedAt", "DESC"],
        limit: 100
    });
};
