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

      query.is_blacklisted = Boolean(is_blacklisted);
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
            type: 'string'
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
  "/Blacklist/:id",
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const { is_blacklisted } = req.body;
    console.log(is_blacklisted);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(appError("id格式無效!請使用系統加密過的參數", next));
    }
    if (!id) {
      return next(appError("id傳入格式異常!請查閱API文件", next));
    }

    if (!id.trim()) {
      return next(appError("id欄位不能為空值！", next));
    }


    if (is_blacklisted !== 1 && is_blacklisted !== 0) {
      return next(appError("is_blacklisted傳入格式異常!請查閱API文件", next));
    }

    const user = await User.findByIdAndUpdate(
      id, // 查找的條件
      { $set: { is_blacklisted } }, // 更新的操作
      { new: true, useFindAndModify: false } // 返回更新後的文檔
    );



    if (!user) {
      return next(appError("使用者未註冊!", next));
    }
    Success(res, "", user);

    /*
    #swagger.tags =  ['會員管理']
    #swagger.path = '/v1/api/Admin/Account/Blacklist/{id}'
    #swagger.method = 'patch'
    #swagger.summary='設定黑名單'
    #swagger.description = '設定黑名單'
    #swagger.produces = ["application/json"] 
  */
    /*
     #swagger.parameters['id'] = {
            in: 'path',
            description: '使用者id',
           
            type: 'string'
         } 
*/
    /*
     /*
        #swagger.requestBody = {
             required: true,
             description:"會員資料",
             content: {
                 "application/json": {
                 schema: {
                     type: "object",
                     properties: {
                          is_blacklisted: {
                             type: "boolean",
                              enum:["1", "0"],
                              example: "1"
                         },
                     },
                     required: ["is_blacklisted"]
                 }  
             }
             }
         } 
 
  }
    
    */
    /*
      #swagger.responses[200] = { 
        schema: {
            "success": true,
            "message": "",
            "data": {
                  "_id": "66d0c762273627e056be5238",
                  "name": "Lobinda",
                  "email": "lobinda123@test.com",
                  "phone": "0987654321",
                  "address": "地球某個角落",
                  "date_of_birth": "2006-08-18T00:00:00.000Z",
                  "role": "user",
                  "remarks": "",
                  "is_blacklisted": false,
                  "id": "66d0c762273627e056be5238"
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
  "/RoleCharacter/:id",
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const { Role } = req.body;
    console.log(Role);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(appError("id格式無效!請使用系統加密過的參數", next));
    }
    if (!id || !Role) {
      return next(appError("id傳入格式異常!請查閱API文件", next));
    }

    if (!id.trim() || !Role.trim()) {
      return next(appError("id欄位不能為空值！", next));
    }



    const user = await User.findByIdAndUpdate(
      id, // 查找的條件
      { $set: { role: Role } }, // 更新的操作
      { new: true, useFindAndModify: false } // 返回更新後的文檔
    );



    if (!user) {
      return next(appError("使用者未註冊!", next));
    }
    Success(res, "", user);

    /*
    #swagger.tags =  ['會員管理']
    #swagger.path = '/v1/api/Admin/Account/RoleCharacter/{id}'
    #swagger.method = 'patch'
    #swagger.summary='設定權限'
    #swagger.description = '設定權限'
    #swagger.produces = ["application/json"] 
  */
    /*
     #swagger.parameters['id'] = {
            in: 'path',
            description: '使用者id',
           
            type: 'string'
         } 
*/
    /*
     /*
        #swagger.requestBody = {
             required: true,
             description:"會員資料",
             content: {
                 "application/json": {
                 schema: {
                     type: "object",
                     properties: {
                          Role: {
                             type: "string",
                             
                              example: "user,admin"
                         },
                     },
                     required: ["Role"]
                 }  
             }
             }
         } 
 
  }
    
    */
    /*
      #swagger.responses[200] = { 
        schema: {
            "success": true,
            "message": "",
            "data": {
                  "_id": "66d0c762273627e056be5238",
                  "name": "Lobinda",
                  "email": "lobinda123@test.com",
                  "phone": "0987654321",
                  "address": "地球某個角落",
                  "date_of_birth": "2006-08-18T00:00:00.000Z",
                  "role": "user",
                  "remarks": "",
                  "is_blacklisted": false,
                  "id": "66d0c762273627e056be5238"
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



module.exports = router;
