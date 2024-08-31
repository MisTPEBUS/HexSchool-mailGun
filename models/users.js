const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "名字 未填寫"],
    },
    photo: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email 未填寫"],
      unique: true,
      lowercase: true,

    },
    password: {
      type: String,
      required: [true, "密碼 未填寫"],
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      minlength: 8,
    },
    address: {
      type: String,
    },
    dateOfBirth: {
      type: Date
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isBlackListed: {
      type: Boolean
    },
    confirmedToken: {
      type: Date,
      select: false,
    },
    confirmedAt: {
      type: Date,
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    remarks: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
const User = mongoose.model("User", userSchema);
module.exports = User;
