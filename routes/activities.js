const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");
const { formatDateToYYYYMMDD } = require("../help/utils.js");
const Activity = require("../models/Activities.js");
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
    const { timeSort, keyWord, page = 1, limit = 10 } = req.query;
    const tSort = timeSort == "asc" ? "createdAt" : "-createdAt";
    let query = {};


    if (keyWord) {
      query.$or = [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ];
    }



    const currentPage = Math.max(parseInt(page) || 1, 1); // 確保 page 是正整數
    const itemsPerPage = Math.max(parseInt(limit) || 10, 1); // 確保 limit 是正整數

    const totalCount = await Activity.countDocuments(query);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    let acties = await Activity.find(query)
      .sort(tSort)
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);





    acties = acties.map(item => {
      return {
        ...item._doc,
        publicAt: formatDateToYYYYMMDD(new Date(item.publicAt)),
        updateAt: formatDateToYYYYMMDD(new Date(item.publicAt)),
      };
    });



    // 設定分頁信息
    const pagination = {
      total: totalCount,
      total_pages: totalPages,
      current_page: currentPage,
      has_pre: currentPage > 1,
      has_next: currentPage < totalPages
    };
    res.data = acties;
    SuccessList(res, "", pagination);


    /*
      #swagger.tags =  ['公告管理']
      #swagger.path = '/v1/api/active'
      #swagger.method = 'get'
      #swagger.summary='公告清單查詢'
      #swagger.description = '公告清單查詢'
      #swagger.produces = ["application/json"] 
    */
    /* 
        #swagger.parameters['keyWord'] = {
            in: 'query',
            description: '關鍵字fuzzy[tittle,content], 預設空直為搜尋全部',
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



//新增資料

//更新資料


//刪除資料





module.exports = router;
