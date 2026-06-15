const express = require("express");
const router = express.Router();

const auth=require("../middleware/auth")
const chatController = require("../controllers/chatController");

router.post("/add-message",auth, chatController.addMessage);
router.get("/messages",auth, chatController.getMessages);

module.exports = router;