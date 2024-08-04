const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "名字 未填寫"],
    },
    email: {
      type: String,
      required: [true, "Email 未填寫"],
      unique: true,
      lowercase: true,
      select: false,
    },
    password: {
      type: String,
      required: [true, "密碼 未填寫"],
      minlength: 8,
      select: false,
    },
    confirmedToken: {
      type: Date,
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    confirmedAt: {
      type: Date,
      select: false,
    },

  },
  {
    versionKey: false,
  },
);
const User = mongoose.model("User", userSchema);

module.exports = User;
