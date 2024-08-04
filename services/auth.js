const jwt = require("jsonwebtoken");
const { handleErrorAsync, appError } = require("../services/handleResponse.js");
const { mailerSender } = require("../services/mail.js");
const User = require("../models/users");

const isAuth = handleErrorAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(appError("請重新登入！", next, 401));
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (!payload) {
        return next(appError("Token格式異常請重新登入！", next));
      }

      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(appError("Token格式異常請重新登入！", next));
  }



  req.user = currentUser;

  next();
});

const generateMailSendJWT = (user, statusCode, res, next) => {
  // 產生 JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_MAIL_EXPIRES_DAY,
  });
  const URL = `http://localhost:2330/v1/api/auth/verify-email/${token}`;
  user.password = undefined;
  user.token = token;
  user.URL = URL;

  mailerSender(user, res, next);
  //api +'/'+ token


};

const generateSendJWT = (user, statusCode, res) => {
  // 產生 JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });

  user.password = undefined;
  res.status(statusCode).json({
    status: "true",
    data: {
      user: {
        token,
        name: user.name,
      },
    },
  });
};

module.exports = {
  isAuth,
  generateSendJWT,
  generateMailSendJWT
};
