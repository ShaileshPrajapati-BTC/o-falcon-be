/**
 * Default model settings
 * (sails.config.models)
 *
 * Your default, project-wide model settings. Can also be overridden on a
 * per-model basis by setting a top-level properties in the model definition.
 *
 * For details about all available model settings, see:
 * https://sailsjs.com/config/models
 *
 * For more general background on Sails model settings, and how to configure
 * them on a project-wide or per-model basis, see:
 * https://sailsjs.com/docs/concepts/models-and-orm/model-settings
 */
const sails = require('sails');
const CommonService = require(sails.config.appPath + '/api/services/common')
module.exports.models = {


    /***************************************************************************
     *                                                                          *
     * Whether the `.create()` and `.update()` model methods should ignore      *
     * (and refuse to persist) unrecognized data-- i.e. properties other than   *
     * those explicitly defined by attributes in the model definition.          *
     *                                                                          *
     * To ease future maintenance of your code base, it is usually a good idea  *
     * to set this to `true`.                                                   *
     *                                                                          *
     * > Note that `schema: false` is not supported by every database.          *
     * > For example, if you are using a SQL database, then relevant models     *
     * > are always effectively `schema: true`.  And if no `schema` setting is  *
     * > provided whatsoever, the behavior is left up to the database adapter.  *
     * >                                                                        *
     * > For more info, see:                                                    *
     * > https://sailsjs.com/docs/concepts/orm/model-settings#?schema           *
     *                                                                          *
     ***************************************************************************/

    schema: true,


    /***************************************************************************
     *                                                                          *
     * How and whether Sails will attempt to automatically rebuild the          *
     * tables/collections/etc. in your schema.                                  *
     *                                                                          *
     * > Note that, when running in a production environment, this will be      *
     * > automatically set to `migrate: 'safe'`, no matter what you configure   *
     * > here.  This is a failsafe to prevent Sails from accidentally running   *
     * > auto-migrations on your production database.                           *
     * >                                                                        *
     * > For more info, see:                                                    *
     * > https://sailsjs.com/docs/concepts/orm/model-settings#?migrate          *
     *                                                                          *
     ***************************************************************************/

    migrate: 'alter',


    /***************************************************************************
     *                                                                          *
     * Base attributes that are included in all of your models by default.      *
     * By convention, this is your primary key attribute (`id`), as well as two *
     * other timestamp attributes for tracking when records were last created   *
     * or updated.                                                              *
     *                                                                          *
     * > For more info, see:                                                    *
     * > https://sailsjs.com/docs/concepts/orm/model-settings#?attributes       *
     *                                                                          *
     ***************************************************************************/

    attributes: {
        createdAt: {type: 'string', columnType: 'datetime', autoCreatedAt: true,},
        updatedAt: {type: 'string', columnType: 'datetime', autoUpdatedAt: true,},
        addedBy: {model: 'User'},
        updatedBy: {model: 'User'},
        id: {type: 'string', columnName: '_id'},
    },


    /******************************************************************************
     *                                                                             *
     * The set of DEKs (data encryption keys) for at-rest encryption.              *
     * i.e. when encrypting/decrypting data for attributes with `encrypt: true`.   *
     *                                                                             *
     * > The `default` DEK is used for all new encryptions, but multiple DEKs      *
     * > can be configured to allow for key rotation.  In production, be sure to   *
     * > manage these keys like you would any other sensitive credential.          *
     *                                                                             *
     * > For more info, see:                                                       *
     * > https://sailsjs.com/docs/concepts/orm/model-settings#?dataEncryptionKeys  *
     *                                                                             *
     ******************************************************************************/

    dataEncryptionKeys: {
        default: '9HudcVA49bXThzND9yZAwgwZcyVexOrM7wTEyN+qh0I='
    },


    /***************************************************************************
     *                                                                          *
     * Whether or not implicit records for associations should be cleaned up    *
     * automatically using the built-in polyfill.  This is especially useful    *
     * during development with sails-disk.                                      *
     *                                                                          *
     * Depending on which databases you're using, you may want to disable this  *
     * polyfill in your production environment.                                 *
     *                                                                          *
     * (For production configuration, see `config/env/production.js`.)          *
     *                                                                          *
     ***************************************************************************/

    cascadeOnDestroy: true,
    beforeCreate: function (document, tableName, cb) {
        if (tableName && _.isString(tableName)) {//this condition for createEach
            let serviceFileName = tableName.substring(0, 1).toLowerCase() + tableName.substring(1, tableName.length);
            let modelService;
            try {
                modelService = require(sails.config.appPath + '/api/services/' + serviceFileName);
                if (modelService.beforeCreate) {
                    modelService.beforeCreate(document, cb);
                } else {
                    cb()
                }
            } catch (e) {
                sails.log.info('model service is not added')
                cb();
            }

        } else {
            if (cb)
                cb()
        }

    },
    beforeUpdate: function (document, tableName, cb) {
        let serviceFileName = tableName.substring(0, 1).toLowerCase() + tableName.substring(1, tableName.length);
        try {
            let modelService = require(sails.config.appPath + '/api/services/' + serviceFileName);
            if (modelService.beforeUpdate) {
                modelService.beforeUpdate(document, cb);
            } else {
                cb()
            }
        } catch (e) {
            sails.log.info('model service is not added');
            cb();
        }

    },
    beforeDestroy: function (document, tableName, cb) {
        try {
            let serviceFileName = tableName.substring(0, 1).toLowerCase() + tableName.substring(1, tableName.length);
            let modelService = require(sails.config.appPath + '/api/services/' + serviceFileName);
            if (modelService.beforeDestroy) {
                modelService.beforeDestroy(document, cb);
            } else {
                cb()
            }
        } catch (e) {
            sails.log.info('model service is not added');
            cb();
        }

    },
    afterUpdate: function (newDocument, oldDocument, tableName, modifier, cb) {
        let serviceFileName = tableName.substring(0, 1).toLowerCase() + tableName.substring(1, tableName.length);
        try {
            let modelService = require(sails.config.appPath + '/api/services/' + serviceFileName);

            if (modelService.afterUpdate) {
                modelService.afterUpdate({records: newDocument, modifier: modifier});
                let operation = 'update';
                //add activity log
                CommonService.addActivityLog({newDocument, tableName, oldDocument, modifier, operation});
                if (_.has(newDocument, "isDeleted") && newDocument.isDeleted) {
                    //delete sync log entry
                    CommonService.deleteSyncLog({records: newDocument, modelIdentity: tableName});
                }
                cb();
            } else {
                cb()
            }
        } catch (e) {
            sails.log.info('model service is not added');
            cb();
        }
    },
    afterCreate: function (newDocument, tableName, cb) {
        let serviceFileName = tableName.substring(0, 1).toLowerCase() + tableName.substring(1, tableName.length);
        try {
            let modelService = require(sails.config.appPath + '/api/services/' + serviceFileName);
            if (modelService.afterCreate) {
                modelService.afterCreate({records: newDocument});
                let operation = 'create';
                //add activity log
                CommonService.addActivityLog({newDocument, tableName, operation});
                cb();
            } else {
                cb()
            }
        } catch (e) {
            sails.log.info('model service is not added');
            cb();
        }
    },
    afterDestroy: async function (newDocument, tableName, cb) {
        let operation = 'remove';
        //add activity log
        await  CommonService.addActivityLog({newDocument, tableName, operation});
        //delete sync log entry
        await CommonService.deleteSyncLog({records: newDocument, modelIdentity: tableName});

        try {
            let serviceFileName = tableName.substring(0, 1).toLowerCase() + tableName.substring(1, tableName.length);
            let modelService = require(sails.config.appPath + '/api/services/' + serviceFileName);
            if (modelService.afterDestroy) {
                modelService.afterDestroy({records: newDocument});
                cb();
            } else {
                cb();
            }
        } catch (e) {
            sails.log.info('model service is not added');
            cb();
        }
    }
};
