const NotificationService = require('../../../services/notification');

module.exports = {
    async paginate(req, res) {
        try {
            let params = req.allParams();
            let filter = await common.getFilter(params);
            filter.where.userId = req.user.id;
            filter.where.status = sails.config.NOTIFICATION.SEND;
            let notificationList = await Notification.find(filter);

            if (!notificationList || !notificationList.length) {
                throw sails.config.message.NOTIFICATION_LIST_NOT_FOUND;
            }
            let response = { list: notificationList };
            let countFilter = await common.removePagination(filter);
            response.count = await Notification.count(countFilter);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async clearAllNotifications(req, res) {
        try {
            await NotificationService.readNotifications(req.user.id, req.user.id);

            return res.ok({}, sails.config.message.NOTIFICATION_READ);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async clearNotification(req, res) {
        try {
            let params = req.allParams();
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            await NotificationService.readNotifications(req.user.id, req.user.id, params.id);

            return res.ok({}, sails.config.message.NOTIFICATION_READ);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },
    
    async getNotices(req, res) {
        try {
            let params = req.allParams();
            let data = [
                {
                    title: 'Service Close due to weather',
                    description: 'Service Close due to weather issue for 2days',
                    dateTime: '2020-12-28T14:28:49.770Z'
                },
                ,
                {
                    title: 'Service Start',
                    description: 'Service will start after Afternoon',
                    dateTime: '2020-12-26T14:28:49.770Z'
                },
                {
                    title: 'Service Close due to Cyclone',
                    description: 'Service Close due to too abd weather for few days, will notify when it resume',
                    dateTime: '2020-12-20T14:28:49.770Z'
                }
            ];
            

            return res.ok(data, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, err);
        }
    },
};