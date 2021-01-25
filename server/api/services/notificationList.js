module.exports = {
    async upsertNotification(options) {
        try {
            let notifications = [];
            _.each(options.users, function (u) {
                notifications.push({
                    title: options.content,
                    data: options.data,
                    userId: u.id,
                    status: sails.config.NOTIFICATION.STATUS.SEND,
                    addedBy: u.id,
                    action: options.action
                });
            });
            let notificationsData = await NotificationList.createEach(notifications).fetch();

            return notificationsData.newRecords;
        } catch (e) {
            throw new Error(e)
        }
    }
};