const { DataTypes } = require("sequelize");
const sequelize = require("../utils/dbConfiguration");

const ArchivedGroupMessage = sequelize.define("archived_group_message", {
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

module.exports = ArchivedGroupMessage;