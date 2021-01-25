/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    tableName: "NotificationList",
    schema: true,
    attributes: {
        title: {
            type: 'STRING',
            required: true,
        },
        data: {
            type: 'JSON'
        },
        userId: {
            model: "user",
            required: true,
        },
        action: {
            type: "number"
        },
        status: {
            type: 'NUMBER',
            description: "SENT -> 1, READ -> 2",
            required: true,
        }
    }
};

