const express = require("express");
const { signup, login, protect } = require("../controllers/authController");
const { allUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, allUsers);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
