const { DataTypes } = require("sequelize");
const { sequelizeDB } = require("../database/db.js");

const Order = sequelizeDB.define(
  "Order",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = Order;
