const User = require("./userModel");
const Chat = require("./chatModel");

User.hasMany(Chat);
Chat.belongsTo(User);

module.exports = {
  User,
  Chat,
};