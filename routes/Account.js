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
    const { timeSort, keyWord, isBlackListed, role, page = 1, limit = 10 } = req.query;
    const tSort = timeSort == "asc" ? "createdAt" : "-createdAt";
    let query = {};
    //關鍵字針對Model中userName + content 搜尋
    if (keyWord) {
      query.$or = [
        { email: new RegExp(keyWord, "i") }
      ];
    }
    // 設定 isBlackListed 的查詢條件

    if (isBlackListed !== undefined) {

      query.isBlackListed = Boolean(isBlackListed);
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
      #swagger.path = '/v1/api/admin/account/'
      #swagger.method = 'get'
      #swagger.summary='會員清單'
      #swagger.description = '會員清單'
      #swagger.produces = ["application/json"] 
    */
    /* 
      #swagger.parameters['role'] = {
            in: 'query',
            description: '管理身分, user,admin',
            enum: ['user', 'admin', 'undefined'],
            type: 'string'
         } 
          #swagger.parameters['isBlackListed'] = {
            in: 'query',
            description: '1:搜尋黑名單 0:不是黑名單, 預設空直為搜尋全部',
            enum: [1, 0, 'undefined'],
            type: 'boolean'
         } 
        
        #swagger.parameters['keyWord'] = {
            in: 'query',
            description: '關鍵字fuzzy[email,phone,address,dateOfBirth], 預設空直為搜尋全部',
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
  "/blackList/:id",
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const { isBlackListed } = req.body;
    console.log(isBlackListed);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(appError("id格式無效!請使用系統加密過的參數", next));
    }
    if (!id) {
      return next(appError("id傳入格式異常!請查閱API文件", next));
    }

    if (!id.trim()) {
      return next(appError("id欄位不能為空值！", next));
    }


    if (isBlackListed !== 1 && isBlackListed !== 0) {
      return next(appError("isBlackListed傳入格式異常!請查閱API文件", next));
    }

    const user = await User.findByIdAndUpdate(
      id, // 查找的條件
      { $set: { isBlackListed } }, // 更新的操作
      { new: true, useFindAndModify: false } // 返回更新後的文檔
    );



    if (!user) {
      return next(appError("使用者未註冊!", next));
    }
    Success(res, "", user);

    /*
    #swagger.tags =  ['會員管理']
    #swagger.path = '/v1/api/admin/account/blackList/{id}'
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
                          isBlackListed: {
                             type: "boolean",
                              enum:["1", "0"],
                              example: "1"
                         },
                     },
                     required: ["isBlackListed"]
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
                  "isBlackListed": false,
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
    #swagger.path = '/v1/api/admin/account/roleCharacter/{id}'
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
                          role: {
                             type: "string",
                             
                              example: "user,admin"
                         },
                     },
                     required: ["role"]
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
                  "isBlackListed": false,
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

//更新資料
router.put(
  "/:id",
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(appError("id格式無效!請使用系統加密過的參數", next));
    }
    if (!id) {
      return next(appError("id傳入格式異常!請查閱API文件", next));
    }

    if (!id.trim()) {
      return next(appError("id欄位不能為空值！", next));
    }
    const allowedFields = ["name",
      "photo", "phone", "address", "date_of_birth",
      "isBlackListed", "role"]; // 前端提供的欄位名稱
    const filteredData = {};


    Object.keys(updateData).forEach((key) => {


      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }

      if (key === "isBlackListed") {

        if (typeof updateData[key] !== 'boolean') {
          return next(appError("黑名單必須是boolean", next));
        }
      }
      if (key === "name") {
        if (!updateData[key].trim()) {
          return next(appError("name欄位不能為空值！", next));
        }
      }
      if (key === "role") {
        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(updateData[key])) {
          return next(appError('role 必須是 "user" 或 "admin" 之一', next));
        }
      }

    });


    const user = await User.findByIdAndUpdate(
      id,
      { $set: filteredData },
      { new: true, useFindAndModify: false }
    );



    if (!user) {
      return next(appError("使用者未註冊!", next));
    }
    Success(res, "", user);

    /*
    #swagger.tags =  ['會員管理']
    #swagger.path = '/v1/api/admin/account/{id}'
    #swagger.method = 'put'
    #swagger.summary='更新基本資料'
    #swagger.description = '更新基本資料'
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
                          name: {
                             type: "string",
                              example: ""
                         },
                          photo: {
                             type: "string",
                              example: ""
                         },
                         
                          phone: {
                             type: "string",
                              example: ""
                         },
                          address: {
                             type: "string",
                              example: ""
                         },
                          date_of_birth: {
                             type: "Date",
                              example: ""
                         },
                          isBlackListed: {
                             type: "Boolean",
                             default: false
                         },
                         
                          role: {
                            type: String,
                            enum: ['user', 'admin'],
                            default: 'user'
                         },
                     },
                    
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
                  "isBlackListed": false,
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

//刪除資料
router.delete(
  "/:id",
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(appError("id格式無效!請使用系統加密過的參數", next));
    }
    if (!id) {
      return next(appError("id傳入格式異常!請查閱API文件", next));
    }

    if (!id.trim()) {
      return next(appError("id欄位不能為空值！", next));
    }


    const user = await User.findByIdAndDelete(
      id,
      { new: true, useFindAndModify: false }
    );

    if (!user) {
      return next(appError("使用者未註冊!", next));
    }
    Success(res, "資料已刪除");

    /*
    #swagger.tags =  ['會員管理']
    #swagger.path = '/v1/api/admin/account/{id}'
    #swagger.method = 'delete'
    #swagger.summary='刪除基本資料'
    #swagger.description = '刪除基本資料'
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
      #swagger.responses[200] = { 
        schema: {
            "success": true,
            "message": "資料已刪除"
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
