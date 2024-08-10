# HexSchool-MailGun

## 項目介紹

HexSchool-MailGun

## 版本控管

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
git clone https://github.com/MisTPEBUS/HexSchool-mailGun.git

# 進入項目目錄
cd HexSchool-mailGun

# 安裝依賴
npm install

npm install dotenv cors mongoose

# 環境變數

PORT=2330
NODE_ENV=production
SWAGGER_HOST=https://[你的URL]
DATABASE=[Mongo]
DATABASE_PASSWORD=[MogoDB密碼]
JWT_SECRET=Lobinda
JWT_EXPIRES_DAY=1d
JWT_MAIL_EXPIRES_DAY=10m
```
