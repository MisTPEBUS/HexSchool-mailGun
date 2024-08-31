// routes/upload.js
const express = require("express");
const router = express.Router();
const { appError, handleErrorAsync } = require("../services/handleResponse.js");
const uploadMiddleware = require("../services/image");
const { v4: uuidv4 } = require("uuid");
const firebaseAdmin = require("../services/firebase");
const bucket = firebaseAdmin.storage().bucket(); // 取出存儲桶內容

const { isAuth } = require("../services/auth");

router.post(
  "/",
  uploadMiddleware,
  handleErrorAsync(async (req, res, next) => {
    if (!req.files.length) {
      return next(appError("尚未上傳檔案", next));
    }
    const file = req.files[0];
    const blob = bucket.file(
      `images/${uuidv4()}.${file.originalname.split(".").pop()}`,
    );
    const blobStream = blob.createWriteStream();

    // buffer 寫入 blobStream
    blobStream.end(file.buffer);

    // 監聽上傳狀態
    blobStream.on("finish", () => {
      // 設定檔案的存取權限
      const config = {
        action: "read", // 權限
        expires: "12-31-2500", // 網址的有效期限
      };
      // 取得檔案的網址
      blob.getSignedUrl(config, (err, fileUrl) => {
        console.log(err);
        if (err) {
          return next(appError(err, next));
        }
        res.status(200).json({
          status: true,
          imageUrl: fileUrl,
        });
      });
    });

    blobStream.on("error", (err) => {
      console.log(err);
      return next(appError("上傳失敗", next, 500));
    });
    /*
  #swagger.tags =  ['圖片上傳']
  #swagger.path = '/v1/api/admin/upload'
  #swagger.method = 'post'
  #swagger.summary='圖片上傳'
  #swagger.description = '圖片上傳'
  #swagger.security = [{
     "bearerAuth": []
 }]
 */

    /*
     #swagger.requestBody = {
             required: true,
             description:"貼文牆",
             content: {
                  "multipart/form-data": {
                   schema: {
                      type: "object",
                     properties: {
                       file: {
                           type: "file",
                         },
                     },
                       required: ["file"]
                   }
                  }
              
             }
         } 
 
  }*/

    /* 
 #swagger.responses[200] = { 
   schema: {
       "status": true,
       "imageUrl": "image URL(https)"
     
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
