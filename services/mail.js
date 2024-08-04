const nodemailer = require('nodemailer');
const { handleErrorAsync, appError } = require("../services/handleResponse.js");


// 创建一个SMTP传输器对象
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    secure: true,
    port: 465,
    auth: {
        user: 'lobinda123@gmail.com',
        pass: 'dyog hjbs xmud tohm'
    }
});


const mailerSender = (user, res, next) => {


    const data = {
        from: `lobinda123@gmail.com`,
        to: user.email,
        subject: 'mailTest',
        text: 'Testing some Mailgun awesomeness!',
        html: `<h1>MailSender is 讚讚!</h1><p>Link:${user.URL}</p>`
    };

    transporter.sendMail(data, function (error, info) {
        if (error) {
            console.log(error.message);
            return next(appError(error, next, 400));
        }

    });
    res.status(200).json({
        status: "true",
        message: "JWT 10分鐘逾時",
        URL: user.URL,
        token: user.token
    });

};

module.exports = {
    mailerSender
};






