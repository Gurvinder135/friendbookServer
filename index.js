const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const router = require("./routes/route");
const cors = require("cors");
var cookieParser = require("cookie-parser");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.URL,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
    credentials: true,
  })
);
console.log(process.env.URL);
app.use(cookieParser());

mongoose.connect(
  "mongodb+srv://gur:gur123456@nodetuts.mx3oj.mongodb.net/fb?retryWrites=true&w=majority",

  () => {
    app.listen(process.env.PORT, () => console.log("listening at " + 4000));
  }
);

app.use(router);
