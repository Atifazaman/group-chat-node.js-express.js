console.log("Chat Archive Cron Loaded");
const cron = require("node-cron");
const { Op } = require("sequelize");

const Chat = require("../models/chatModel");
const ArchivedChat = require("../models/archivedChat");

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running Chat Archive Job...");

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
console.log("oneDayAgo:", oneDayAgo);

    const oldChats = await Chat.findAll({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    console.log("Found chats:", oldChats.length);

    if (!oldChats.length) {
      console.log("No chats to archive");
      return;
    }

   await ArchivedChat.bulkCreate(
  oldChats.map(chat => ({
    message: chat.message,
    fileUrl: chat.fileUrl,
    fileType: chat.fileType,
    userTableId: chat.userTableId,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  }))
);

    await Chat.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    console.log(`${oldChats.length} chats archived successfully`);
  } catch (err) {
    console.error("Archive Job Error:", err);
  }
});