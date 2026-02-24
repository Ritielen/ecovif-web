const Sequelize = require("sequelize");
const sequelizeconnect = new Sequelize(
    "db_ecovif",
    "postgres",
    "postgres",
    {
        host: "localhost",
        port: "5432",
        dialect: "postgres",
    }
);

module.exports = sequelizeconnect;