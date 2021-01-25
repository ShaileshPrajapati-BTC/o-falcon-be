const EmailService = require(sails.config.appPath + '/api/services/email');
const SMSService = require(sails.config.appPath + '/api/services/sms');
const NotificationService = require(sails.config.appPath + '/api/services/notification');
let CommonService = require(`${sails.config.appPath}/api/services/common`);

module.exports = {

    async paginate(req, res) {
        try {
            let params = req.allParams();
            // get filter
            let filter = await CommonService.getFilter(params);
            if (params.dateRange && params.dateRange.startDate) {
                filter.where.updatedAt = {
                    '>=': new Date(params.dateRange.startDate),
                    '<=': new Date(params.dateRange.endDate)
                };
            }

            let recordsList = await Notification
                .find(filter)
                .populate('vehicleId', { select: ['name'] })
                .populate('franchiseeId',{ select: ['firstName', 'lastName', 'name'] })
                .meta({ enableExperimentalDeepTargets: true });
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let response = { list: recordsList };
            // count
            let countFilter = await CommonService.removePagination(filter);
            response.count = await Notification
                .count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });
            response.unreadNotificationsCount = await NotificationService.getAdminNotificationCount();

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    /**
     * send Notification to individual user
     * @method POST
     * @param req users:array
     * users:[
     * {mobile:{"mobile":"9876543210",
     *              "isPrimary":true},
     * email:{
     *          "email":"email@gmail.com",
     *          "isPrimary":true}
     *          },
     * id="user_id"]
     * @param res
     * @description:
     * @returns {*}
     * @author {*}
     * @see {*}
     */
    async sendNotification(req, res) {
        let params = req.allParams();

        try {
            if (!params || !params.users || _.isEmpty(params.users) || !params.content) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            await Promise.all(_.map(params.users, async (usr) => {
                let user = await User.findOne({
                    where: { id: usr.id },
                    select: ['emails', 'mobiles', 'name', 'androidPlayerId', 'iosPlayerId', 'preferredLang']
                });
                if (params.type === sails.config.NOTIFICATION.TYPE.EMAIL) {
                    if (!params.subject || params.subject === '') {
                        params.subject = sails.config.DEFAULT_MAIL_SUBJECT;
                    }
                    if (params.content && params.content !== '') {
                        let emails = [];
                        if (user) {
                            _.each(user.emails, (checkEmail) => {
                                if (checkEmail) {
                                    emails.push(checkEmail.email);
                                }
                            });
                        }
                        let primaryEmails = emails.join();
                        let mail_obj = {
                            subject: params.subject,
                            to: primaryEmails,
                            template: 'notificationEmail',
                            data: {
                                content: params.content,
                                language: user.preferredLang
                            },
                            name: user.name
                        };
                        EmailService.send(mail_obj);

                    }
                } else if (params.type === sails.config.NOTIFICATION.TYPE.SMS) {
                    if (params.content && params.content !== '') {
                        let senderMobileNum = [];
                        if (user) {
                            _.each(user.mobiles, (mbl) => {
                                if (mbl) {
                                    senderMobileNum.push(mbl.countryCode + mbl.mobile);
                                }
                            });
                        }
                        senderMobileNum = senderMobileNum.join();
                        let smsObj = {
                            message: params.content,
                            mobiles: senderMobileNum
                        };
                        SMSService.send(smsObj);

                    }
                } else {
                    let playerIds = [];
                    playerIds = playerIds.concat(user.androidPlayerId);
                    playerIds = playerIds.concat(user.iosPlayerId);

                    NotificationService
                        .sendPushNotification({
                            playerIds: playerIds,
                            content: params.content,
                            language: params.language
                        });
                }

                return user;


            }));

            return res.ok(params.users, { message: sails.config.message.NOTIFICATION_SEND_SUCCESSFULLY });

        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async readNotification(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            await NotificationService.readNotifications(req.user.id, null, params.id);

            return res.ok({}, sails.config.message.NOTIFICATION_READ);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },

    async readAllNotification(req, res) {
        try {
            await NotificationService.readNotifications(req.user.id, null);

            return res.ok({}, sails.config.message.NOTIFICATION_READ);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    }
};
