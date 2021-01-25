/**
 * Master.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


const deleteSyncService = require(sails.config.appPath + '/api/services/deleteSync');
const masterService = require(sails.config.appPath + '/api/services/master');
module.exports = {
    tableName: 'Master',
    schema: true,
    attributes: {

        name: {
            type: 'STRING'
        },
        normalizeName: {
            type: 'STRING'
            /*defaultsTo: function () {
                return this.name.toLowerCase();
            }*/
        },
        slug: {
            type: 'STRING'
        },
        code: {
            type: 'STRING'
        },
        group: {
            type: 'STRING'
        },
        description: {
            type: 'STRING'
        },

        isActive: {
            type: 'BOOLEAN'
        },
        isDefault: {
            type: 'BOOLEAN'
        },
        sortingSequence: {
            type: 'NUMBER'
        },

        image: {
            type: 'STRING'
        },
        icon: {
            type: 'STRING'
        },

        likeKeyWords: {
            type: 'JSON',
            columnType: 'ARRAY'
        },


        // self relation
        parentId: {
            model: 'Master',
            columnName: 'parentId'
        },

        // fetching masters related to parent
        subMasters: {
            collection: 'Master',
            via: 'parentId'
        },

        isDeleted: {
            type: 'BOOLEAN',
            defaultsTo: false
        },
        multiLanguageData: {
            type: 'json',
            columnType: 'object',
            description: {
                fieldType: 'object'
            }
        }

    }
};
