const { DataTypes } = require("sequelize");
const { sequelizeDB } = require("../database/db.js");

const CustomerType = sequelizeDB.define(
  "CustomerType",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "customertypes",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = CustomerType;
