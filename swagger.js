const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

const doc = {
  info: {
    version: "1.0.0", // by default: '1.0.0'
    title: "FOODIE-FUND", // by default: 'REST API'
    description: "眾資成城-在你心愛的餐廳成為合夥人", // by default: ''
  },
  servers: [

    {
      url: "https://foodiefund.onrender.com", // by default: 'http://localhost:3000'
      description: "Render", // by default: ''
    },
    {
      url: "http://127.0.0.1:2330", // by default: 'http://localhost:3000'
      description: "Local", // by default: ''
    },
  ],
  tags: [
    // by default: empty Array
    {
      name: "使用者登入驗證",
      description: "Users&Auth",
    },
    {
      name: "會員管理",
      description: "Account",
    },
    {
      name: "公告管理",
      description: "Activity",
    },
    {
      name: "管理者設定",
      description: "Admin_Setting",
    },
    {
      name: "圖片上傳",
      description: "Upload",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "./swagger_output.json"; // 輸出的文件名稱
const endpointsFiles = ["./app.js"]; // 要指向的 API，通常使用 Express 直接指向到 app.js 就可以

swaggerAutogen(outputFile, endpointsFiles, doc); // swaggerAutogen 的方法
