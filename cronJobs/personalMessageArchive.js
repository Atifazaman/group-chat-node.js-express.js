const cron = require("node-cron");
const { Op } = require("sequelize");

const PersonalMessage = require("../models/personalMessageModel");
const ArchivedPersonalMessage = require("../models/archivedPersonalMessage");

console.log("Personal Message Archive Cron Loaded");

cron.schedule("0 0 * * *", async () => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const oldMessages = await PersonalMessage.findAll({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    if (!oldMessages.length) {
      console.log("No personal messages to archive");
      return;
    }

    await ArchivedPersonalMessage.bulkCreate(
      oldMessages.map(msg => ({
        message: msg.message,
        fileUrl: msg.fileUrl,
        fileType: msg.fileType,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }))
    );

    await PersonalMessage.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneDayAgo,
        },
      },
    });

    console.log(
      `${oldMessages.length} personal messages archived successfully`
    );
  } catch (err) {
    console.error("Personal Archive Error:", err);
  }
});