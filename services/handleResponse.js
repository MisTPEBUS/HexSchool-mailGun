//  success Response
const Success = (res, message = "", data = "", status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

//  success Response
const SuccessList = (res, message = "", pagination, status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data: res.data,
    pagination
  });
};

// NotFound Response
const NotFound = (errMessage, next) => {
  const error = new Error(errMessage);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};

// Error Response
const appError = (errMessage, next, httpStatus = 400) => {
  const error = new Error(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  next(error);
};

// 回傳 Express 應用程式錯誤處理
const handleAppMainErrorResponse = (env, err, res) => {
  if (env === "dev") {
    // 開發環境錯誤
    res.status(err.status || 500).json({
      message: err.message || "系統錯誤",
      error: err,
      stack: err.stack,
    });
  } else {
    // 正式環境錯誤
    if (err.isOperational) {
      res.status(err.status || 500).json({
        message: err.message,
      });
    } else {
      // log 紀錄
      console.error("出現重大錯誤", err);

      res.status(500).json({
        status: "error",
        message: "系統錯誤，請恰系統管理員",
      });
    }
  }
};

// 處理非同步錯誤
const handleErrorAsync = function handleErrorAsync(func) {
  return function (req, res, next) {
    func(req, res, next).catch(function (error) {
      return next(error);
    });
  };
};

module.exports = {
  Success,
  SuccessList,
  NotFound,
  appError,
  handleAppMainErrorResponse,
  handleErrorAsync,
};
