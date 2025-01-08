const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const RefreshToken = sequelize.define("RefreshToken", {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = RefreshToken;
