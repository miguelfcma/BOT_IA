const { DataTypes } = require("sequelize");
const { sequelizeDB } = require("../database/db.js");

const Channel = sequelizeDB.define(
  "Channel",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "channels",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = Channel;
