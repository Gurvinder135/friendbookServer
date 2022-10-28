const express = require("express");
const router = express.Router();

const {
  postLogin,
  postRegister,
  isAuthenticate,
} = require("../controller/controller");

router.post("/login", postLogin);

router.post("/register", postRegister);
router.get("/isAuthenticate", isAuthenticate);
// router.get("/logout", (req, res) => {
//   req.logout();
//   res.send("success");
// });

module.exports = router;
