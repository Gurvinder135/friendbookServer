const User = require("../model/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const addingUser = (ar, username, firstname, lastname, us) => {
  let arr = [...ar];
  for (let x in arr) {
    arr[x].username = username;
    arr[x].firstname = firstname;
    arr[x].lastname = lastname;
  }

  return arr;
};

const sort = async (username) => {
  let primary = await User.findOne({ username: username }).lean();

  priArr = [...primary.comments];
  priArr = addingUser(
    priArr,
    primary.username,
    primary.firstname,
    primary.lastname,
    primary.username
  );
  let temp = [];
  for (let val in primary.friend) {
    let x = primary.friend[val];

    let sec = await User.find({ username: x.username }).lean();
    let comment = addingUser(
      sec[0].comments,
      sec[0].username,
      sec[0].firstname,
      sec[0].lastname,
      primary.username
    );
    temp = [...temp, ...comment];
  }
  let finalArr = [...priArr, ...temp];
  finalArr.sort(function (a, b) {
    return b.time - a.time;
  });
  return finalArr;
};

module.exports.postLogin = async (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  let result = await User.find({ username: username });
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
  res

    .cookie("Token", token, {
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json("success");
};

module.exports.postRegister = async (req, res) => {
  let salt = await bcrypt.genSalt();
  let newUser = req.body;
  newUser.password = await bcrypt.hash(newUser.password, salt);
  const user = new User(req.body);
  await user.save();

  res.send("/");
};

module.exports.authGuard = async (req, res, next) => {
  try {
    if (req.cookies.Token) {
      let result = jwt.verify(req.cookies.Token, "abc");
      let data = await User.findOne({ username: result.data });
      next();
    } else {
      res.json("not logged in");
    }
  } catch (error) {
    res.json("not logged in");
  }
};

module.exports.isAuthenticate = async (req, res) => {
  try {
    if (req.cookies.Token) {
      let result = jwt.verify(req.cookies.Token, "abc");
      let data = await User.findOne({ username: result.data });
      let comment = [];
      await sort(result.data).then((result) => {
        comment = result;
        res.send({
          _id: data._id,
          username: data.username,
          firstname: data.firstname,
          lastname: data.lastname,
          comment: comment,
          profilePic: data.profilePic,
        });
      });

      return;
    } else {
      res.clearCookie("Token").json("not logged in");
    }
  } catch (error) {
    res.json("not logged in");
  }
};

module.exports.postComment = async (req, res) => {
  let { username, input } = req.body;
  let result = await User.findOne({ username: username });
  let newArray = [
    { comment: input, userId: result.id, time: Date.now() },
    ...result.comments,
  ];
  let result1 = await User.findOneAndUpdate(
    { username: username },
    { comments: newArray },
    {
      new: true,
    }
  );
  res.send("success");
};
module.exports.postComment = async (req, res) => {
  let { username, input } = req.body;
  let result = await User.findOne({ username: username });
  let newArray = [
    { comment: input, userId: result.id, time: Date.now() },
    ...result.comments,
  ];
  let result1 = await User.findOneAndUpdate(
    { username: username },
    { comments: newArray },
    {
      new: true,
    }
  );
  res.send("success");
};
module.exports.postImage = async (req, res) => {
  let { username, input } = req.body;
  let result = await User.findOne({ username: username });
  let newArray = [
    { image: input, userId: result.id, time: Date.now() },
    ...result.comments,
  ];
  await User.findOneAndUpdate(
    { username: username },
    { comments: newArray },
    {
      new: true,
    }
  );
  res.send("success");
};

module.exports.deleteComment = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { username: req.params.username },
    { $pull: { comments: { _id: req.params.id } } },
    {
      new: true,
    }
  );

  res.send("success");
};

module.exports.postSubComment = async (req, res) => {
  let { username, firstname, lastname, subInput, _id, userId } = req.body;
  let result = await User.findById(userId);
  let temp = {};

  for (let x in result.comments) {
    if (result.comments[x].id === _id) {
      temp = result.comments[x];
      let newArray = [
        {
          comment: subInput,
          subId: result.id,
          commentUsername: username,
          firstname,
          lastname,
        },
        ...temp.subcomment,
      ];
      let newObj = [...result.comments];
      newObj[x].time = Date.now();
      newObj[x].subcomment = newArray;
      await User.findOneAndUpdate(
        { username: result.username },
        { comments: newObj },
        {
          new: true,
        }
      );
      res.send("sucess");
    }
  }
};

module.exports.search = async (req, res) => {
  if (req.body.query === "") {
    let doc = await User.find({});
    res.send(doc);
  } else {
    let doc = await User.find({
      $or: [
        { firstname: { $regex: req.body.query, $options: "i" } },
        { lastname: { $regex: req.body.query, $options: "i" } },
      ],
    }).limit(10);

    res.send(doc);
  }
};

module.exports.friend = async (req, res) => {
  if (req.body.status === "sent") {
    await User.findOneAndUpdate(
      { username: req.body.self },
      { $push: { sentRequest: { username: req.body.third } } }
    );
    await User.findOneAndUpdate(
      { username: req.body.third },
      { $push: { pending: { username: req.body.self } } }
    );
  } else if (req.body.status === "confirm") {
    await User.findOneAndUpdate(
      { username: req.body.self },
      {
        $pull: { pending: { username: req.body.third } },
        $push: { friend: { username: req.body.third } },
      }
    );
    await User.findOneAndUpdate(
      { username: req.body.third },
      {
        $pull: { sentRequest: { username: req.body.self } },
        $push: { friend: { username: req.body.self } },
      }
    );
  }

  res.send("success");
};
module.exports.like = async (req, response) => {
  let result = await User.findById(req.body.userId);

  let likeObj = {
    likedBy: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  };

  for (let x in result.comments) {
    let stop = 0;
    if (result.comments[x].id === req.body.postId) {
      for (let y in result.comments[x].likes) {
        if (result.comments[x].likes[y].likedBy === req.body.username) {
          result.comments[x].likes.splice(y, 1);
          stop = 1;
        }
      }
      if (stop === 0) {
        result.comments[x].likes.push(likeObj);
      }

      let res = await User.findByIdAndUpdate(
        req.body.userId,
        {
          comments: result.comments,
        },
        {
          new: true,
        }
      );
      response.send("success");
    }
  }
};
module.exports.postProfilePic = async (req, res) => {
  let username = req.body.username;
  let image = req.body.image;
  await User.findOneAndUpdate({ username }, { profilePic: image });
  res.send("success");
};
