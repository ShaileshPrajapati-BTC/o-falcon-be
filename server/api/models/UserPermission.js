/**
 * UserPermission.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'UserPermission',
    schema: true,
    attributes: {
        userId: {
            model: 'User',
        },
        // type of user
        type: {
            type: 'number'
        },
        operations: {
            type: "json",
            columnType: "array",
            description: {
                module: {
                    type: 'number'
                },
                insert: {
                    type: 'boolean'
                },
                update: {
                    type: 'boolean'
                },
                delete: {
                    type: 'boolean'
                }
            },
            example: [{
                module: 1,
                insert: true,
                update: false,
                delete: false
            }]
        }
    }
};
