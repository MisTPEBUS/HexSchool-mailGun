# HexSchool-Meta-Wall

## 項目介紹

HexSchool-Meta-Wall

## 版本控管

### Week 3

1. 建立 Express 版本
2. 建立 `./models/posts.js` 模型
3. 建立 `./routes/posts.js` API
   - 3-1. 查詢全部
   - 3-2. 查詢單筆
   - 3-3. 新增單筆資料
   - 3-4. 修改單筆資料
   - 3-5. 刪除單筆資料

**助教補充:**

1. 可在 `app.js` 路由下方加上一個找不到頁面的 404 錯誤訊息捕捉。
2. 刪除單筆資料時，若使用者傳入格式正確但不存在的 `ObjectId`，Mongoose 預設會回傳 `null` 並回傳刪除成功，可以再針對此情況自訂錯誤訊息。
3. 由於最終作業是一個臉書動態牆，不能有新增空白內容的情況，因此建議 `PUT` 這裡加上一個 `data.content` 是否為空的判斷，或者可以在 `findByIdAndUpdate` 加入第三個參數 `{ runValidators: true }`，讓 `findByIdAndUpdate` 也可以跑 Schema 驗證規則，可以參考這篇文章 [https://israynotarray.com/nodejs/20220301/1465076357/](https://israynotarray.com/nodejs/20220301/1465076357/)。

### Week 4 (整合 User Model, 貼文 API)

1. 建立 `./models/users.js` 模型
2. 在 `./models/posts.js` 中關聯 `users` 模型
3. 更新 `./routes/posts.js` API
   - 3-1. 查詢全部: 加入時間排序和篩選關鍵字
   - 3-2. 新增貼文: 檢查欄位

**助教補充:**

- `console.log` 測試完畢後可以移除。
- 宣告部分建議使用 `let`、`const` 來取代 `var` 的方式。
- 正確 `200` 與錯誤 `400` 等狀態的管理，可以另外建立一個檔案後匯入，可以避免不斷重複的程式碼。
- 在新增貼文的部分，`postToDelete` 並沒有這個資料，所以新增貼文時會出現錯誤。
- `.env` 的檔案記得要有空白的 example，這樣才能知道這份檔案需要載入的環境變數有哪些。
- 可以在 `content` 這類必備的資料內加入 `.trim` 去除空格，避免使用者會輸入純空白讓系統判斷有值。
- 目前查詢的部分有一些錯誤導致無法查詢，例如沒有導入 `User`，`Schema` 也有錯誤的部分，但是 Render 是可以查詢的。

### Week 5 Express Middleware 異常狀態處理

1. 設計一個 Middleware，讓程式碼中不需要使用 `try catch`
2. 透過環境變數設定在開發和生產環境下的不同回饋訊息
3. 客製化各種錯誤狀態，包括 NPM 的錯誤訊息
4. 使用 `node.js` 的 `uncaughtException` 和 `unhandledRejection` 來捕捉預期外的錯誤

**助教補充:**

- GET 貼文的搜尋功能（keyWord）目前無法運作，這個部分可再檢查看看哩
- 因為這份作業最後呈現的是貼文牆，所以會建議補上 tags、likes 、type 等資料欄位，以接續後續的作業進行。
- 貼文部分少了一支刪除全部貼文的 API，建議要補上唷～（後續作業會審核到這個部分，如果沒有補上則之後會被審核失敗哩）

## Week 6 Express Middleware 異常狀態處理

1. LV1：設計五個 API

- [x] POST：{url}/users/sign_up：註冊
- [x] POST：{url}/users/sign_in：登入
- [x] POST：{url}/users/updatePassword: 重設密碼
- [x] GET：{url}/users/profile: 取得個人資料，需設計 isAuth middleware。
- [x] PATCH：{url}/users/profile: 更新個人資料，需設計 isAuth middleware

- 額外
- [x] GET：{url}/users/profile: 登出。

2. LV2：調整第四週 API，都加上登入驗證的 middleware

- [x] GET：{url}/posts/：觀看所有動態
- [x] GET：{url}/posts/:id：觀看指定動態
- [x] POST：{url}/posts/：張貼個人動態
- [x] PUT：{url}/posts/:id：修改動態內容
- [x] DELETE：{url}/posts/:id：刪除指定動態
- [x] DELETE：{url}/posts/ALL：刪除個人所有動態

3. swagger 文件

- [x] swagger 文件

## Week 7 firebase 第三方圖床服務 API 介接

- [x] 介接 firebase 第三方圖床服務
- [x] 設計一個 /upload 路由，來設計上傳圖片功能，後端得驗證是否符合 2mb 限制、格式支援 jpg、png
- [x] 需通過 isAuth 登入驗證 middleware 才可上傳

## Week 8 實作一個 FB、IG 牆

主線任務
請設計 17 隻 API，請使用 POSTMAN collection 透過資料夾來分類。
若有額外新增 API，請於任務內容分享，並告知想看哪 5 支 API。
會員功能

- [x] [POST]註冊會員：{url}/user/sign_up
- [x] [POST]登入會員：{url}/users/sign_in
- [x] [PATCH]重設密碼：{url}/users/updatePassword
- [x] [GET]取得個人資料：{url}/users/profile
- [x] [PATCH]更新個人資料：{url}/users/profile

會員按讚追蹤動態

- [x] [POST]追蹤朋友：{url}/users/{userID}/follow
- [x] [DELETE]取消追蹤朋友：{url}/users/{userID}/unfollow
- [x] [GET]取得個人按讚列表：{url}/users/getLikeList
- [x] [GET]取得個人追蹤名單：{url}/users/following

動態貼文

- [x] [GET]取得所有貼文：{url}/posts
- [x] [GET]取得單一貼文：{url}/posts/{postID}
- [x] [POST]新增貼文：{url}/posts
- [x] [POST]新增一則貼文的讚：{url}/posts/{postID}/like
- [x] [DELETE]取消一則貼文的讚：{url}/posts/{postID}/unlike
- [ ] [POST]新增一則貼文的留言：{url}/posts/{postID}/comment
- [x] [GET]取得個人所有貼文列表：{url}/post/user/{userID}
      其他

- [x] [POST]圖片上傳：{url}/upload

## 技術棧

- express --no view
- mongoose
- dotenv
- swagger-autogen
- swagger-jsdoc
- swagger-ui-express
- jsonwebtoken
- validator
- bcrypt
- multer
- uuid
- firebase-admin

## 安裝指南

```bash
# 複製倉庫
git clone https://github.com/yourusername/HexSchool-Meta-Wall.git

# 進入項目目錄
cd HexSchool-Meta-Wall

# 安裝依賴
npm install

npm install dotenv cors mongoose

# 環境變數
PORT=2330
NODE_ENV=dev
SWAGGER_HOST=https://[你的URL]
DATABASE=[Mongo]
DATABASE_PASSWORD=[MogoDB密碼]
JWT_SECRET=
JWT_EXPIRES_DAY=1d
FIREBASE_TYPE=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_AUTH_URI=
FIREBASE_TOKEN_URI=
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=
FIREBASE_CLIENT_X509_CERT_URL=
```
