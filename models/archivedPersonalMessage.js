const { DataTypes } = require("sequelize");
const sequelize = require("../utils/dbConfiguration");

const ArchivedPersonalMessage = sequelize.define("archived_personal_message", {
   id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  
    message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  fileType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = ArchivedPersonalMessage;