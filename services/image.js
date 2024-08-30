// statusHandle/image.js
const multer = require("multer");
const path = require("path");
const { appError, handleErrorAsync } = require("../services/handleResponse.js");

//multer
const upload = multer({
  limits: {
    //限制檔案大小為3M
    fileSize: 3 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"));
    }
    cb(null, true);
  },
}).any();

const uploadMiddleware = handleErrorAsync(async (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      // next send err msg
      return next(appError(err.message, next));
    }
    if (!req.files || req.files.length === 0) {
      return next(appError("檔案不能為空值", next));
    }
    if (req.files.length > 1) {
      return next(appError("只能上傳一個文件", next));
    }
    next();
  });
});
module.exports = uploadMiddleware;
