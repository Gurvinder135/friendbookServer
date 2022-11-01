const User = require("../model/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.postLogin = async (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let result = await User.find({ userName: username });
  if (result.length === 0) {
    res.send("Username Not Found !!!");
    return;
  }
  let passMatch = await bcrypt.compare(password, result[0].password);
  if (!passMatch) {
    res.send("Wrong Password !!!");
    return;
  }
  let token = jwt.sign({ data: username }, "abc", { expiresIn: 1800 });
  res.status(200).send({ token, result });
};

module.exports.postRegister = async (req, res) => {
  let salt = await bcrypt.genSalt();
  let newUser = req.body;
  newUser.password = await bcrypt.hash(newUser.password, salt);
  const user = new User(req.body);
  await user.save();

  res.send("/");
};

module.exports.isAuthenticate = async (req, res) => {
  if (req.cookies.Token) {
    console.log(req.cookies);
    let result = jwt.verify(req.cookies.Token, "abc");
    let data = await User.find({ userName: result.data });
    res.send(data);
    return;
  } else {
    res.send(req.cookies);
  }
};
