/**
 * DeleteSyncModel.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'DeleteSync',
    schema: true,
    attributes: {
        module: {
            type: 'string'
        },
        recordId: {
            type: 'STRING'
        },
        data: {
            type: 'JSON',
            columnType: 'OBJECT'
        }
    }
};

