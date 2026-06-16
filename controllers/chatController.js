const Chat = require("../models/chatModel");
const userTable=require("../models/userModel")

const addMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const data = await Chat.create({
      message,
      userTableId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Message stored successfully",
      data,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
const getMessages = async (req, res) => {

  try {

    const messages = await Chat.findAll({
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      success: true,
      messages,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });

  }

};

const searchUser = async (req, res) => {
  try {
    const email = req.query.email;

    const user = await userTable.findOne({
      where: { email },
      attributes: ["id", "name", "email"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  addMessage,getMessages, searchUser
};