const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");
const User = require("../models/users.js");
const {
  Success,
  SuccessList,
  appError,
} = require("../services/handleResponse.js");
const { handleErrorAsync } = require("../services/handleResponse.js");
const { isAuth, generateSendJWT, generateMailSendJWT } = require("../services/auth.js");


//清單
router.get(
  "/",
  handleErrorAsync(async (req, res, next) => {
    const { timeSort, keyWord, is_blacklisted, role, page = 1, limit = 10 } = req.query;


    const tSort = timeSort == "asc" ? "createdAt" : "-createdAt";
    let query = {};
    //關鍵字針對Model中userName + content 搜尋
    if (keyWord) {
      query.$or = [
        { email: new RegExp(keyWord, "i") },

      ];
    }
    // 設定 is_blacklisted 的查詢條件
    if (is_blacklisted !== undefined) {
      if (is_blacklisted === 'true') {
        query.is_blacklisted = true;
      } else if (is_blacklisted === 'false') {
        query.is_blacklisted = false;
      }

    }

    // 設定 role 的查詢條件
    if (role !== undefined) {
      if (role === 'user') {
        query.role = 'user';
      } else if (role === 'admin') {
        query.role = 'admin';
      }

    }

    // 計算分頁參數
    const currentPage = Math.max(parseInt(page) || 1, 1); // 確保 page 是正整數
    const itemsPerPage = Math.max(parseInt(limit) || 10, 1); // 確保 limit 是正整數

    // 計算符合條件的總數
    const totalCount = await User.countDocuments(query);

    // 計算總頁數
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // 查詢資料並根據時間排序和分頁
    const users = await User.find(query)
      .sort(tSort)
      .skip((currentPage - 1) * itemsPerPage) // 跳過前面頁數的資料
      .limit(itemsPerPage); // 取回目前頁面的資料

    // 設定分頁信息
    const pagination = {
      total: totalCount,
      total_pages: totalPages,
      current_page: currentPage,
      has_pre: currentPage > 1,
      has_next: currentPage < totalPages
    };
    res.data = users;
    SuccessList(res, "", pagination);


    /*
      #swagger.tags =  ['會員管理']
      #swagger.path = '/v1/api/Admin/Account/'
      #swagger.method = 'get'
      #swagger.summary='會員清單'
      #swagger.description = '會員清單'
      #swagger.produces = ["application/json"] 
    */
    /* 
      #swagger.parameters['role'] = {
            in: 'query',
            description: '管理身分, 預設空直為搜尋全部',
            enum: ['user', 'admin', 'undefined'],
            type: 'boolean'
         } 
          #swagger.parameters['is_blacklisted'] = {
            in: 'query',
            description: '1:搜尋黑名單 0:不是黑名單, 預設空直為搜尋全部',
            enum: [1, 0, 'undefined'],
            type: 'boolean'
         } 
        #swagger.parameters['keyWord'] = {
            in: 'query',
            description: '關鍵字fuzzy[email], 預設空直為搜尋全部',
            type: 'string'
         } 
         #swagger.parameters['timeSort'] = {
            in: 'query',
            description: '排序遠到近,進到遠default = desc',
           enum: ['asc', 'desc'],
            type: 'string'
         } 
        #swagger.parameters['limit'] = {
            in: 'query',
            description: '清單顯示比數,default=10',
          
            type: 'number'
         } 
        #swagger.parameters['page'] = {
            in: 'query',
            description: '顯示第幾頁資料default=1',
         
            type: 'number'
         } 
    */
    /*
 
  #swagger.responses[201] = { 
    description: "回傳登入token,使用為"
    schema: {
        "status": "true",
        "data": {
             "user": {
                 "token": "eyJhbGciOiJ..........mDWPvJZSxu98W4",
                 "name": "Lobinda"
             }
        }
      }
    } 
  #swagger.responses[400] = { 
    schema: {
        "status": false,
        "message": "Error Msg",
      }
    } 
 */
  }),
);

//黑名單
router.patch(
  "/{id}/",
  handleErrorAsync(async (req, res, next) => {
    let { email, password } = req.body;
    if (!email || !password) {
      return next(appError("傳入格式異常!請查閱API文件", next));
    }
    // Content cannot null

    if (!email.trim() || !validator.isEmail(email)) {
      return next(appError("Email欄位格式異常！", next));
    }
    if (!password.trim()) {
      return next(appError("Password欄位不能為空值！", next));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(appError("使用者未註冊!", next));
    }

    /* if (!user.confirmedAt) {
      return next(appError("email未驗證!", next, 403));
    } */

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError("帳號密碼錯誤!", next));
    }
    generateSendJWT(user, 200, res);

    /*
    #swagger.tags =  ['使用者登入驗證']
    #swagger.path = '/v1/api/auth/sign_in'
    #swagger.method = 'post'
    #swagger.summary='會員登入'
    #swagger.description = '會員登入'
    #swagger.produces = ["application/json"] 
  */
    /*
 #swagger.requestBody = {
             required: true,
             content: {
                 "application/json": {
                 schema: {
                     type: "object",
                     properties: {
                          email: {
                             type: "string",
                              example: "Lobinda123@test.com"
                         },
                          password: {
                             type: "string",
                             example: "1q2w3e4r"
                         },
                     },
                     required: ["email", "password"]
                 }  
             }
             }
         } 
 
  }
  #swagger.responses[200] = { 
    schema: {
        "status": "true",
        "data": {
             "user": {
                 "token": "eyJhbGciOiJ..........mDWPvJZSxu98W4",
                 "name": "Lobinda"
             }
        }
      }
    } 
  #swagger.responses[400] = { 
    schema: {
        "status": false,
        "message": "Error Msg",
      }
    } 
    #swagger.responses[403] = { 
    schema: {
        "status": false,
        "message": "Mail not verified",
      }
    } 
 */
  }),
);

//管理員
router.patch(
  "/updatePassword",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return next(appError("傳入格式異常!請查閱API文件", next));
    }

    if (!password.trim()) {
      return next(appError("password不得為空值!", next));
    }
    if (!confirmPassword.trim()) {
      return next(appError("confirmPassword不得為空值!", next));
    }

    if (!validator.isLength(password, { min: 8 })) {
      return next(appError("密碼至少8碼", next));
    }

    if (password !== confirmPassword) {
      return next(appError("密碼不一致！", next));
    }

    // 將新密碼加密
    newPwd = await bcrypt.hash(password, 12);

    // 更新資料庫
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPwd,
    });

    // JWT
    generateSendJWT(user, 200, res);

    /*
      #swagger.tags =  ['使用者登入驗證']
      #swagger.path = '/v1/api/auth/updatePassword'
      #swagger.method = 'patch'
      #swagger.summary='更新密碼'
      #swagger.description = '更新密碼'
      #swagger.produces = ["application/json"] 
      #swagger.security = [{
        "bearerAuth": []
    }]
    */
    /*
 #swagger.requestBody = {
             required: true,
             content: {
                 "application/json": {
                 schema: {
                     type: "object",
                     properties: {
                          password: {
                             type: "string",
                             description: "至少要8碼",
                             example: "1q2w3e4r"
                         },
                         confirmPassword: {
                             type: "string",
                             description: "至少要8碼",
                             example: "1q2w3e4r"
                         },
                     },
                     required: [ "password", "confirmPassword"]
                 }  
             }
             }
         } 
 
  }
  #swagger.responses[200] = { 
    schema: {
        "status": "true",
        "data": {
             "user": {
                 "token": "eyJhbGciOiJ..........mDWPvJZSxu98W4",
                 "name": "Lobinda"
             }
        }
      }
    } 
  #swagger.responses[400] = { 
    schema: {
        "status": false,
        "message": "Error Msg",
      }
    } 
 */
  }),
);



module.exports = router;
