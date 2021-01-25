module.exports.routes = {
    /** *********** Notification ************************************/
    'POST /admin/notification/paginate': 'Admin/NotificationController.paginate',

    'POST /admin/notification/send': {
        controller: 'Admin/NotificationController',
        action: 'sendNotification',
        swagger: {
            summary: 'Send notification',
            description: 'This is send notification to user',
            body: {
                type: { type: 'number' },
                content: { type: 'string' },
                users: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: { id: { type: 'string' } }
                    }
                }
            }
        }
    },
    // 'GET /admin/notification/clear-all': {
    //     controller: 'Admin/NotificationController',
    //     action: 'clearAllNotifications',
    //     // module: config.modules.notification,
    //     // operation: config.permission.update,
    //     swagger: {
    //         summary: 'clear all notifications',
    //         description: '',
    //         body: {}
    //     }
    // },
    'POST /admin/notification/read-notification': {
        controller: 'Admin/NotificationController',
        action: 'readNotification',
        swagger: {
            summary: 'read notification',
            description: '',
            body: {
                id: {
                    type: 'string'
                }
            }
        }
    },
    'POST /admin/notification/read-all-notification': {
        controller: 'Admin/NotificationController',
        action: 'readAllNotification',
        swagger: {
            summary: 'read notification',
            description: '',
            body: {
                id: {
                    type: 'string'
                }
            }
        }
    }
};
