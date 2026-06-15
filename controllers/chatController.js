const Chat = require("../models/chatModel");

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

module.exports = {
  addMessage,getMessages
};