const OneSignal = require('onesignal-node');
const EmailService = require('./email');
// const SmsService = require('./sms');
const TranslateService = require('./Translation');
const UtilService = require(`./util`);

module.exports = {
    async sendPushNotification(options) {
        console.log("&&&&& SEND PUSH NOTIFICATION &&&&&")
        if (!sails.config.ONE_SIGNAL_USER_AUTH_KEY || !sails.config.ONE_SIGNAL_APP_AUTH_KEY) {
            console.log('----------One Signal Credentials Empty----------');

            return;
        }
        const myClient = new OneSignal.Client({
            userAuthKey: sails.config.ONE_SIGNAL_USER_AUTH_KEY,
            // note that "app" must have "appAuthKey" and "appId" keys
            app: {
                appAuthKey: sails.config.ONE_SIGNAL_APP_AUTH_KEY,
                appId: sails.config.ONE_SIGNAL_APP_ID
            }
        });
        let playerIds = options.playerIds;
        const onesignalLanguages = {
            'pt-PT': 'pt',
            'es-ES': 'es',
            'ar-AE': 'ar'
        };
        let language = 'en';
        let message = options.content;
        if (options.language && onesignalLanguages[options.language]) {
            language = onesignalLanguages[options.language];
            message = TranslateService.translateMessage(message, options.language);
        }
        let configObj = {
            contents: {
                [language]: message
            }
        };
        if (options.data) {
            configObj.data = options.data;
        }
        if (playerIds !== 'all') { // send to specific playerids
            configObj.include_player_ids = _.compact(playerIds)
        } else {
            // send to all device
            configObj.included_segments = ['All']
        }
        let notification = new OneSignal.Notification(configObj);

        myClient.sendNotification(notification, (err, httpResponse, data) => {
            if (err) {
                sails.log.error(sails.config.message.SOMETHING_WENT_WRONG);
            } else {
                sails.log.info(data);
            }
        });
    },
    async notifyAdmin(options) {
        try {
            let users = await User.find({
                where: {
                    type: sails.config.USER.TYPE.ADMIN
                },
                select: ['name', 'emails', 'mobiles', 'preferredLang']
            });
            await Promise.all(_.map(users, (user) => {
                let userEmail = _.find(user.emails, (e) => {
                    return e.isPrimary;
                });
                let mail_obj = {
                    subject: 'Daily Stats',
                    to: userEmail.email,
                    template: 'notifyDailyStats',
                    data: {
                        name: user.name || '-',
                        email: userEmail.email || '-',
                        data: options.data,
                        language: preferredLang
                    }
                };
                // send mail
                EmailService.send(mail_obj);
                let userMobile = _.find(user.mobiles, (e) => {
                    return e.isPrimary;
                });
                let smsObj = {
                    message: sms.content,
                    mobiles: userMobile.countryCode + userMobile.mobile
                };
                // SmsService.send(smsObj);
            }));

            return true;
        } catch (e) {
            throw new Error(e);
        }

    },
    getNotificationType(val) {
        const notificationTypeValue = sails.config.NOTIFICATION.NOTIFICATION_TYPES[val];
        if (!notificationTypeValue) {
            return 0;
        }

        return notificationTypeValue;
    },

    async readNotifications(updatedBy, userId, id = null) {
        let where = {
            userId: userId,
            status: sails.config.NOTIFICATION.STATUS.SEND
        };
        if (id) {
            where.id = id;
        }
        let dataToUpdate = {
            status: sails.config.NOTIFICATION.STATUS.READ,
            updatedBy: updatedBy
        };
        let updatedRecord = await Notification
            .update(where)
            .set(dataToUpdate)
            .fetch();
        if (!updatedRecord || updatedRecord.length <= 0) {
            throw sails.config.message.NOTIFICATION_NOT_READ;
        }
        let data = {
            count: 0
        };
        data.count = await this.getAdminNotificationCount();
        await socketEvents.sendNotificationCountUpdate(data);
    },

    async getAdminNotificationCount() {
        let count = await Notification.count({
            userId: null,
            status: sails.config.NOTIFICATION.STATUS.SEND
        });

        return count;
    },

    // sendInterval
    async sendIotNotification(data, sendInterval, franchiseeId = null, dealerId = null) {
        if (sendInterval > 0) {
            const timeToCheck = UtilService.subtractTime(sendInterval);
            const lastNotification = await Notification.find({
                where: {
                    vehicleId: data.vehicleId,
                    type: data.type,
                    createdAt: {
                        '>=': timeToCheck
                    }
                }
            });
            if (lastNotification && lastNotification.length > 0) {
                return true;
            }
        }
        data.module = sails.config.modules.vehicle;
        if (sails.config.IS_FRANCHISEE_ENABLED && franchiseeId) {
            data.franchiseeId = franchiseeId;
        }
        if (dealerId) {
            data.dealerId = dealerId;
        }
        await Notification.create(data).fetch();
    },
    async vehicleAddOrUpdate(vehicle, isUpdate = false) {
        let vehicleType = sails.config.VEHICLE_TYPE_STRING[vehicle.type];
        let msg = `New ${vehicleType} added with IMEI: ${vehicle.imei}`;
        let type = sails.config.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.VEHICLE_ADD;
        if (isUpdate) {
            msg = `${vehicleType} updated with IMEI: ${vehicle.imei}`;
            type = sails.config.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.VEHICLE_UPDATE;
        }
        let data = {
            title: msg,
            vehicleId: vehicle.id,
            // data: vehicle,
            vehicleType: vehicle.type,
            status: sails.config.NOTIFICATION.STATUS.SEND,
            type: type,
            module: sails.config.modules.vehicle,
            addedBy: vehicle.addedBy
        };
        if (sails.config.IS_FRANCHISEE_ENABLED && vehicle.franchiseeId) {
            data.franchiseeId = vehicle.franchiseeId;
        }
        if (vehicle.dealerId) {
            data.dealerId = vehicle.dealerId;
        }
        await Notification.create(data).fetch();
    },
    async sendConnectionNotification(vehicle, connectionType) {
        let vehicleType = sails.config.VEHICLE_TYPE_STRING[vehicle.type];
        let connectedMsg = 'connected';
        let priority = sails.config.PRIORITY.NO_PRIORITY;
        if (connectionType === sails.config.NOTIFICATION.ADMIN_NOTIFICATION.TYPE.VEHICLE_DISCONNECTED) {
            connectedMsg = 'disconnected';
            priority = sails.config.PRIORITY.HIGH;
        }
        let data = {
            title: `${vehicleType}: ${vehicle.name} ${connectedMsg}, IMEI: ${vehicle.imei}.`,
            vehicleId: vehicle.id,
            // data: vehicle,
            vehicleType: vehicle.type,
            status: sails.config.NOTIFICATION.STATUS.SEND,
            type: connectionType,
            module: sails.config.modules.vehicle,
            priority: priority
        };
        if (sails.config.IS_FRANCHISEE_ENABLED && vehicle.franchiseeId) {
            data.franchiseeId = vehicle.franchiseeId;
        }
        if (vehicle.dealerId) {
            data.dealerId = vehicle.dealerId;
        }
        await Notification.create(data).fetch();
    },
    afterCreate: async function (options) {
        let notification = options.records;
        await socketEvents.notifyAdmin(notification);
    }
};
