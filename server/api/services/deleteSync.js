const commonQueryBuilder = require('./common');
const moment             = require('moment');
module.exports           = {

    /**
     * @desc : store delete data id
     * @param options
     * @return: <*> promise
     */
    logDeletedRecords: async (options) => {
        let logDeletedRecords = [];

        _.forEach(options.records, (record) => {
            logDeletedRecords.push({
                module  : options.module,
                recordId: record.id,
                data    : record
            })
        });
        return await DeleteSync.createEach(logDeletedRecords).meta({skipAllLifecycleCallbacks: true});

    },


    /**
     * @desc : store delete data id
     * @param options
     * @return: <*> promise
     */
    syncRecords: async (options) => {
        let response =[];

        if (options.module && options.lastSyncDate) {
            let lastSyncFilter          = commonQueryBuilder.getSyncDateFilter(options);
            lastSyncFilter.where.module = options.module;

            let deletedRecords = await DeleteSync.find(lastSyncFilter);
            if (deletedRecords && deletedRecords.length) {
                response = _.map(deletedRecords, 'recordId')
            }
        }
        return response
    }
};
