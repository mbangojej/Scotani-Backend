const fs = require('fs')
const EmailTemplate = require('../../models/emailTemplates.model');
const Settings = require('../../models/settings.model');
const { appEmail, appPassword, baseUrl, uploadedImgPath, mailgunApi, mailgunDomain } = require("../../../config/vars");
const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
const moment = require("moment")

//get email template for the title
async function getEmailContent(type, data) {
    data.siteName = "SCOTANI"
    data.siteLogo = uploadedImgPath + "logo.png"
    data.siteUrl = baseUrl
    data.year = moment().year()
    let emails = await EmailTemplate.findOne({ type });
    let emailContent = '';
    let subject = "";
    if (emails) {
        emailContent = emails.content,
            subject = emails.subject
    }
    else {
        emailContent = '';
        subject = '';
    }
    let keys = Object.keys(data);

    if (keys.length) {
        for (let key in keys) {
            let thisKey = keys[key];
            let keyInContent = "${{" + thisKey + "}}";
            let regEx = new RegExp(keyInContent.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
            emailContent = emailContent.replace(regEx, data[thisKey])
        }
    }
    let settings = await Settings.findOne({})
    let keyInContent = "${{logo}}";
    let regEx = new RegExp(keyInContent.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
    emailContent = emailContent.replace(regEx, settings.siteLogo)
    emailContent = emailContent.replace(/\$\{\{year\}\}/g, new Date().getFullYear())

    return { emailContent, subject };
}


exports.sendEmail = async (type, data) => {
    async function main() {
        let { emailContent, subject } = await getEmailContent(type, data);
        var mailOptions = {
            from: 'Scotani <app@scotani.com>',
            to: data.email,
            subject,
            html: emailContent,
        };
        if (data.bcc) {
            mailOptions.bcc = data.bcc
        }
        const mailgun = require('mailgun-js')({ apiKey: mailgunApi, domain: mailgunDomain });
        mailgun.messages().send(mailOptions, async (error, a) => { 
            if (error) {
                console.log('error')
                console.log(error)
            }else{
                console.log('a')
                console.log(a)
            }
        })

        // var transporter = nodemailer.createTransport(smtpTransport({
        //     host: 'smtp-relay.brevo.com',
        //     port: 587,
        //     // tls: { servername: "https://skin-canvas.arhamsoft.org" },
        //     auth: {
        //         user: appEmail,
        //         pass: appPassword
        //     }
        // }));
        // transporter.sendMail(mailOptions, function (error, info) {
        //     if (error) {
        //         console.log("🚀 ~ file: emails.js:129 ~ error:", error)

        //     } else {
        //         console.log("🚀 ~ file: emails.js:129 ~ info:", info)

        //         return info
        //     }
        // });
    }
    main().catch(console.error);
}