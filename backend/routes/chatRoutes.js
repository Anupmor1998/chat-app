const express = require("express");
const { protect } = require("../controllers/authController");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/rename", protect, renameGroup);
router.put("/group-remove", protect, removeFromGroup);
router.put("/group-add", protect, addToGroup);

module.exports = router;
