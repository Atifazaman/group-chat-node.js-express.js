const express = require("express");
const router = express.Router();

const auth=require("../middleware/auth")
const chatController = require("../controllers/chatController");

router.post("/add-message",auth, chatController.addMessage);
router.get("/messages",auth, chatController.getMessages);

router.get("/search-user", auth, chatController.searchUser);

router.get("/users", auth, chatController.getUsers);


router.post("/group/create",auth, chatController.createGroup);

router.get("/group/my-groups",auth, chatController.getMyGroups);

router.post(
 "/group/add-member",
 auth,
 chatController.addMember
);


router.post(
 "/group/add-message",
 auth,
 chatController.addGroupMessage
);
router.get(
 "/group/:groupId/messages",
 auth,
 chatController.getGroupMessages
);


module.exports = router;