const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

router.post("/add-message", chatController.addMessage);

module.exports = router;