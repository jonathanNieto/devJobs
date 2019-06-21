const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

// async..await is not allowed in global scope, must use a wrapper
exports.send = async function (options) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: emailConfig.auth.user,
            pass: emailConfig.auth.pass
        }
    });

    /* utilizar templates de handlebars */
    transporter.use('compile', hbs({
        /* viewEngine: 'handlebars', */
        viewEngine: {
            extName: '.handlebars',
            partialsDir: __dirname + '/../views/emails',
            layoutsDir: __dirname + '/../views/emails',
            defaultLayout: options.filename,
          },
        viewPath: __dirname + '/../views/emails',
        extName: '.handlebars',
    }));


    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"devJobs" <noreply@devjobs.com>',
        to: options.user.email,
        subject: options.subject,
        template: options.filename,
        context: {
            resetUrl: options.resetUrl
        }
    });

    console.log({info});
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
