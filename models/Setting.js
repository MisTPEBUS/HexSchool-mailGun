const mongoose = require("mongoose");
const SettingSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['private', 'admin'],
      required: true,

    },
    content: {
      type: [sectionSchema], // 陣列欄位，包含多個 sectionSchema 物件
      required: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updateAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
const Setting = mongoose.model("Setting", userSchema);

module.exports = Setting;
