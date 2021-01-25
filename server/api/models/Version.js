/**
 * Version.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'version',
    schema: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        // Android, IOS
        platform: {
            type: 'number',
            required: true
            //in: [1,2]
        },
        isActive: {
            type: 'boolean'
        },
        isHardUpdate: {
            type: 'boolean',
            defaultsTo: false
        },

        // App Version number
        number: {
            type: 'number',
            required: true
        },
        createdBy: {
            model: 'User'
        },
        updatedBy: {
            model: 'User'
        }
    }
};
