const mongoose = require("mongoose");
const ActSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            default: '請輸入內容',
            required: true,
        },

        isEnabled: {
            type: Boolean,
            default: true,
        },
        isTop: {
            type: Boolean,
            default: false,
        },

        publicAt: {
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
const Activity = mongoose.model("Activities", ActSchema);

module.exports = Activity;
