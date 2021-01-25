/**
 * Permission.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'Roles',
    attributes: {
        addedBy: { model: 'User' },
        updatedBy: { model: 'User' },
        // string
        title: { type: 'string' },
        // json array
        permissions: {
            type: 'JSON',
            columnType: 'array'
        },
        // boolean
        isActive: {
            type: 'boolean',
            defaultsTo: true
        },

        isDefault: {
            type: 'boolean',
            defaultsTo: false
        },

        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};

