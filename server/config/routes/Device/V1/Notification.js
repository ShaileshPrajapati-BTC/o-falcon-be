module.exports.routes = {
    'POST /api/v1/notification/paginate': {
        controller: 'Device/V1/NotificationController',
        action: 'paginate'
    },
    'DELETE /api/v1/notification/clear-all-notifications': {
        controller: 'Device/V1/NotificationController',
        action: 'clearAllNotifications'
    },
    'POST /api/v1/notification/clear-notifications': {
        controller: 'Device/V1/NotificationController',
        action: 'clearNotification'
    },
    'POST /api/v1/notice/paginate': {
        controller: 'Device/V1/NotificationController',
        action: 'getNotices'
    },
};