const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true },
  profilePic: { type: String },
  friend: [
    {
      username: String,
    },
  ],
  pending: [
    {
      username: String,
    },
  ],
  sentRequest: [
    {
      username: String,
    },
  ],
  comments: [
    {
      comment: String,
      userId: String,
      time: Number,
      image: String,
      likes: [
        {
          likedBy: String,
          firstname: String,
          lastname: String,
        },
      ],
      subcomment: [
        {
          comment: String,
          subId: String,
          commentUsername: String,
          firstname: String,
          lastname: String,
        },
      ],
    },
  ],
});

const User = mongoose.model("user", userSchema);
module.exports = User;
