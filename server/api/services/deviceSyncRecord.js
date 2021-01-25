const moment = require('moment');

module.exports = {

    /**
     * Common Sync service
     * @param options   params => <object> => conference_id, last_sync
     *                  modelIdentity => Model identity name
     *                  modelNumber => <int> - constant num for model
     *                  filter => If any special condition
     * @returns {Promise.<{list: *, deleted: *, last_sync: number, tags_with_color: *}>}
     */
    syncRecords: async (options) => {
        let params = options.params;
        let modelIdentity = options.modelIdentity;
        //let modelNumber = options.modelNumber || sails.config.modules[modelIdentity];

        let lastSyncDate = params.lastSyncDate * 1;
        lastSyncDate = moment(lastSyncDate).add(-2, 'minute').valueOf();
        lastSyncDate = moment(lastSyncDate).toISOString();

        const where = {
            where: {
                updatedAt: {
                    '>=': lastSyncDate
                }
            }
        };

        if (options.filter) {
            _.extend(where['where'], options.filter);
        }

        let syncDataList = await sails.models[modelIdentity].find(where);


        let deleteRecordFilter = {
            where: {
                updatedAt: {
                    '>=': lastSyncDate
                },
                module: options.modelIdentity
            }
        };

        let deletedRecord = await DeleteSync.find(deleteRecordFilter);

        return {
            list: syncDataList && syncDataList.length ? syncDataList : null,
            deleted: deletedRecord && deletedRecord.length ? deletedRecord : null,
            lastSync: moment().valueOf()
        };

    }
};
