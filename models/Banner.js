const { DataTypes } = require("sequelize");
const { sequelizeDB } = require("../database/db.js");

const Banner = sequelizeDB.define(
  "Banner",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "banners",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  }
);

module.exports = Banner;
