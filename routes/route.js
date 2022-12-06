const express = require("express");
const router = express.Router();

const {
  postLogin,
  postRegister,
  isAuthenticate,
  postComment,
  deleteComment,
  postSubComment,
  postImage,
  search,
  friend,
  postProfilePic,
  like,
  authGuard,
} = require("../controller/controller");

router.post("/login", postLogin);
router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/register", postRegister);
router.get("/isAuthenticate", isAuthenticate);
router.post("/logout", (req, res) => {
  res.clearCookie("Token", { secure: true, sameSite: "None" }).send("sucess");
});
router.post("/postComment", authGuard, postComment);
router.delete("/deleteComment/:username/:id", authGuard, deleteComment);

router.post("/postsubComment", authGuard, postSubComment);
router.post("/postImage", authGuard, postImage);
router.post("/postProfilePic", authGuard, postProfilePic);
router.post("/search", authGuard, search);
router.post("/friend", authGuard, friend);
router.post("/like", authGuard, like);

module.exports = router;
