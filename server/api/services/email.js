/* eslint-disable max-lines-per-function */
/**
 * Created by CIS1 on 25-02-2015.
 */

const Email = require('email-templates');
const nodemailer = require('nodemailer');
const TranslationService = require('./Translation');
const path = require('path');
const fs = require('fs');

module.exports = {
    send: function (obj, cb) {
        if (!sails.config.MAIL_AUTH_USER || !sails.config.MAIL_AUTH_PASS) {
            console.log('----------Mail Auth User/Pass Empty----------');

            return;
        }
        let transport = nodemailer.createTransport({
            service: 'Mailgun',
            auth: {
                user: sails.config.MAIL_AUTH_USER,
                pass: sails.config.MAIL_AUTH_PASS
            }
        });
        if (!obj.data.language) {
            obj.data.language = 'en-US';
        }
        obj.data.lang = obj.data.language.toString().substr(0, 2);
        obj.data.textDirection = 'ltr';
        if (sails.config.RTL_LANGUAGES.indexOf(obj.data.language) > -1) {
            obj.data.textDirection = 'rtl';
        }
        let subject = obj.subject;
        if (subject) {
            subject = TranslationService.translateMessage(subject, obj.data.language);
        }
        let message = {
            from: `${sails.config.PROJECT_NAME}<${obj.from || sails.config.PROJECT_DEFAULT_MAIL}>`,
            subject: subject
        };
        if (obj.attachments) {
            let i = 0;
            message.attachments = [];
            for (let attachment of obj.attachments) {
                i++;
                message.attachments.push({
                    filename: path.basename(attachment),
                    path: `${sails.config.appPath}/assets/${attachment}`
                });
            }
        }
        const email = new Email({
            message: message,
            send: true,
            transport: transport,
            views: {
                options: {
                    extension: 'ejs' // <---- HERE
                }
            }
        });
        if (!_.isArray(obj.to)) {
            obj.to = [obj.to];
        }

        if (obj.template !== 'common') {
            obj.data.template = `../${obj.template}/html.ejs`;
        }
        // obj.data.name = obj.name;
        console.log('obj.data');
        console.log(obj.data);
        console.log('obj.data');
        Promise.all(_.map(obj.to, (emailId) => {
            email
                .send({
                    template: obj.template,
                    message: { to: emailId },
                    locals: obj.data
                })
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                });
        }));
    }
};