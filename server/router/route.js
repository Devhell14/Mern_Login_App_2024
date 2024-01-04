const express = require("express");
const router = express.Router();

// controllers
const {
  verifyUser,
  register,
  login,
  getUser,
  updateUser,
  generateOTP,
  verifyOTP,
  createResetSession,
  resetPassword,
} = require("../controllers/appController");
const { registerMail } = require("../controllers/mailer");
const { auth, localVariables } = require("../middleware/auth");

/** POST Methods */
router.post("/register", register);
router.post("/registerMail", registerMail); // send the email
router.post("/authenticate", verifyUser, (req, res) => res.end()); // authenticate user
router.post("/login", verifyUser, login); // login in app

// router.post("/register", (req, res) => {
//   res.json("register route"); // register user
// });

/** GET Methods */
router.get("/user/:username", getUser); // user with username
router.get("/generateOTP", verifyUser, localVariables, generateOTP); // generate random OTP
router.get("/verifyOTP", verifyUser, verifyOTP); // verify generated OTP
router.get("/createResetSession", createResetSession); // reset all the variables

/** PUT Methods */
router.put("/updateUser", auth, updateUser); // is use to update the user profile
router.put("/resetPassword", verifyUser, resetPassword); // use to reset password

module.exports = router;
