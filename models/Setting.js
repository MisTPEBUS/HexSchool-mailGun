const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    tittle: {
      type: String,
    },

    type: {
      type: String,
      enum: ['private', 'admin'],
    },
    is_Used: {
      type: Boolean,
      default: true,
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
    updateAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
const User = mongoose.model("User", userSchema);

module.exports = User;
