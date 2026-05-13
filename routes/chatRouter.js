const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

router.post("/add-message", chatController.addMessage);
router.get("/messages", chatController.getMessages);

module.exports = router;