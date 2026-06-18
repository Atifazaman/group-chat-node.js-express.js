const User = require("./userModel");
const Chat = require("./chatModel");
const Group = require("./groupModel");
const GroupMember = require("./groupMemberModel");
const GroupMessage = require("./groupMessageModel");
const PersonalMessage = require("./personalMessageModel");

User.hasMany(Chat);
Chat.belongsTo(User);

// Personal Chat
User.hasMany(PersonalMessage, {
  foreignKey: "senderId",
  as: "sentMessages"
});

PersonalMessage.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender"
});


User.hasMany(PersonalMessage, {
  foreignKey: "receiverId",
  as: "receivedMessages"
});

PersonalMessage.belongsTo(User, {
  foreignKey: "receiverId",
  as: "receiver"
});


// Group Creator
User.hasMany(Group, {
  foreignKey: "createdBy",
  as: "createdGroups"
});

Group.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator"
});


// Group Members
Group.hasMany(GroupMember, {
  foreignKey: "groupId"
});

GroupMember.belongsTo(Group, {
  foreignKey: "groupId"
});


User.hasMany(GroupMember, {
  foreignKey: "userId"
});

GroupMember.belongsTo(User, {
  foreignKey: "userId"
});


// Group Messages
Group.hasMany(GroupMessage, {
  foreignKey: "groupId"
});

GroupMessage.belongsTo(Group, {
  foreignKey: "groupId"
});


User.hasMany(GroupMessage, {
  foreignKey: "userId",
  as: "sentGroupMessages"
});

GroupMessage.belongsTo(User, {
  foreignKey: "userId",
  as: "sender"
});

module.exports = {
  User,
  Chat,
    Group,
  GroupMember,
  GroupMessage,
  PersonalMessage
};