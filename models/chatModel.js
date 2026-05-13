const {DataTypes} = require("sequelize");
const sequelize = require("../utils/dbConfiguration");

const Chat = sequelize.define("chat", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Chat;