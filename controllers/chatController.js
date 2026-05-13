const Chat = require("../models/chatModel");

const addMessage = async (req, res) => {

  try {

    const { message, userId } = req.body;

    if (!message) {

      return res.status(400).json({
        success: false,
        message: "Message is required",
      });

    }

    const data = await Chat.create({
      message,
      userTableId:userId,
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

module.exports = {
  addMessage,
};