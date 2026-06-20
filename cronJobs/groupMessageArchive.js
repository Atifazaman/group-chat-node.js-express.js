const cron = require("node-cron");
const { Op } = require("sequelize");

const GroupMessage = require("../models/groupMessageModel");
const ArchivedGroupMessage = require("../models/archivedGroupMessage");

console.log("Group Message Archive Cron Loaded");

cron.schedule("0 0 * * *", async () => {
  try {

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const oldMessages = await GroupMessage.findAll({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo
        }
      }
    });

    if (!oldMessages.length) {
      console.log("No group messages to archive");
      return;
    }

    await ArchivedGroupMessage.bulkCreate(
      oldMessages.map(msg => ({
        message: msg.message,
        fileUrl: msg.fileUrl,
        fileType: msg.fileType,
        userId: msg.userId,
        groupId: msg.groupId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      }))
    );

    await GroupMessage.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo
        }
      }
    });

    console.log(
      `${oldMessages.length} group messages archived successfully`
    );

  } catch (err) {
    console.error("Group Archive Error:", err);
  }
});