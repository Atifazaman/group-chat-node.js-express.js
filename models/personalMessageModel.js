const { DataTypes } = require("sequelize");
const sequelize = require("../utils/dbConfiguration");

const PersonalMessage = sequelize.define("personalMessage", {
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
  fileUrl: {
 type: DataTypes.TEXT,
 allowNull:true
},

fileType:{
 type:DataTypes.STRING,
 allowNull:true
}
});

module.exports = PersonalMessage;