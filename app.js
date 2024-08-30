const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");


const usersRouter = require("./routes/users");
const AccountRouter = require("./routes/Account");
const UploadRouter = require("./routes/upload");
const dotenv = require("dotenv");


dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

// 程式出現重大錯誤時
process.on("uncaughtException", (err) => {
  console.error("Uncaughted Exception！");
  console.error(err);
  process.exit(1);
});

const constr = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD,
);

mongoose.set("strictQuery", false);

mongoose.connect(constr).then(() => console.log("連線資料成功"));

const app = express();

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerFile));

app.use("/v1/api/auth", usersRouter);
app.use("/v1/api/Admin/Account", AccountRouter);
app.use("/v1/api/Admin/Upload", UploadRouter);

// 404 錯誤
app.use(function (req, res, next) {
  res.status(404).json({
    status: "error",
    message: "查無此路由，請確認API格式!",
  });
});
// 自己設定的 err 錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: false,
      message: err.message,
    });
  } else {
    console.error("出現重大錯誤", err);
    res.status(500).json({
      status: "error",
      message: "系統錯誤，請恰系統管理員",
    });
  }
};
// 開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
// 錯誤處理
app.use(function (err, req, res, next) {
  // dev

  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "dev") {
    return resErrorDev(err, res);
  }

  // production
  else if (process.env.NODE_ENV === "production") {
    if (err.name === "ValidationError") {
      err.message = "欄位未填寫正確";
      err.isOperational = true;
      return resErrorProd(err, res);
    }
    resErrorProd(err, res);
  }
});

// 未捕捉到的 catch
process.on("unhandledRejection", (reason, promise) => {
  console.error("未捕捉到的 rejection：", promise, "原因：", reason);
});

module.exports = app;
