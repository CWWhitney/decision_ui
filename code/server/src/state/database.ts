import {
    Sequelize,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    HasManyGetAssociationsMixin
} from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
    define: {
        freezeTableName: true
    }
});

export class UserTable extends Model<InferAttributes<UserTable>, InferCreationAttributes<UserTable>> {
    declare id: CreationOptional<number>;
    declare username: string;
    declare password: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare getModels: HasManyGetAssociationsMixin<ModelTable>;
}

UserTable.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    },
    {
        sequelize,
        tableName: "user"
    }
);

export class ModelTable extends Model<InferAttributes<ModelTable>, InferCreationAttributes<ModelTable>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string;
    declare userId: ForeignKey<UserTable["id"]>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare file: string;
}

ModelTable.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        file: DataTypes.JSONB
    },
    {
        sequelize,
        tableName: "model"
    }
);

UserTable.hasMany(ModelTable, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "models"
});

(async () => {
    await sequelize.sync();
})();
