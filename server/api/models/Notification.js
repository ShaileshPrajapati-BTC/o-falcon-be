/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'Notification',
    attributes: {
        title: {
            type: 'STRING',
            required: true
        },
        description: {
            type: 'string',
            defaultsTo: ''
        },
        vehicleId: {
            model: 'Vehicle',
            required: true
        },
        userId: { model: 'user' },
        franchiseeId:{model:'user'},
        dealerId:{model:'user'},
        data: { type: 'JSON' },
        status: {
            type: 'NUMBER',
            required: true
        },
        type: {
            type: 'number',
            description: sails.config.NOTIFICATION.ADMIN_NOTIFICATION.TYPE
        },
        vehicleType: {
            type: 'number',
            extendedDescription: sails.config.VEHICLE_TYPE,
            defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE
        },
        module: {
            type: "number",
            extendedDescription: sails.config.modules,
            defaultsTo: sails.config.modules.vehicle
        },
        priority: {
            type: "number",
            extendedDescription: sails.config.PRIORITY,
            defaultsTo: sails.config.PRIORITY.NO_PRIORITY
        }
    }
};

