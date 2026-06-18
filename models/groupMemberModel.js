const { DataTypes } = require("sequelize");
const sequelize = require("../utils/dbConfiguration");

const GroupMember = sequelize.define("groupMember", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = GroupMember;