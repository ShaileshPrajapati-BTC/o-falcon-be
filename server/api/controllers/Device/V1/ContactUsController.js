const modelName = 'ContactUs';
const EmailService = require(`${sails.config.appPath}/api/services/email`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);

module.exports = {
    async add(req, res) {
        try {
            let params = req.allParams();
            const loggedInUser = req.user;
            params.userId = loggedInUser.id;
            let option = {
                params: params,
                modelName: modelName
            };

            let user = await User.findOne({ id: params.userId });
            let primaryEmail = UtilService.getPrimaryValue(user.emails, 'email');
            params.from = primaryEmail;
            params.to = sails.config.SUPPORT_REQUEST_EMAILS;
            await commonValidator.validateCreateParams(option);
            let createdRecord = await ContactUs.create(params).fetch();
            await EmailService.send({
                subject: createdRecord.subject,
                to: sails.config.SUPPORT_REQUEST_EMAILS,
                attachments: createdRecord.attachments,
                from: primaryEmail,
                template: 'common',
                data: {
                    name: user.name || '-',
                    message: createdRecord.message,
                    language: user.preferredLang
                }
            });

            return res.ok(createdRecord, sails.config.message.CONTACT_US_CREATED);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};
