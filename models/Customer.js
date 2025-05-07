const { DataTypes } = require("sequelize");
const { sequelizeDB } = require("../database/db.js");

const Customer = sequelizeDB.define(
  "Customer",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "customers",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = Customer;
