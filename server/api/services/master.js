"use strict";

const common = require(sails.config.appPath + '/api/services/common');
const config = require(sails.config.appPath + '/config/constant/master');
const ObjectId = require('mongodb').ObjectID;
module.exports = {

    /**
     * @description: getting query builder of locations
     * @param options "{
     *                      "search":"keyword" | "/active" | "/default" | "latest"
     *                }"
     * @param callback
     */
    getFilter: async (options) => {
        let filter = await common.getFilter(options);
        // search
        // options.isOnlyParents = true;

        // active file
        const isActiveFilter = options && _.has(options, 'isActive');
        if (isActiveFilter) {
            filter.where.isActive = options.isActive;
        }
        const isDefaultFilter = options && _.has(options, 'isDefault');
        if (isDefaultFilter) {
            filter.where.isDefault = options.isDefault;
        }
        if (!options.sort && filter.sort && filter.sort.length) {
            filter.sort = [{
                sortingSequence: 'ASC'
            }]
        }

        // filter by parent
        if (_.has(options, 'parentId') && options.parentId) {
            filter.where["parentId"] = options.parentId;
        }
        else if (_.has(options, 'isOnlyParents') && options.isOnlyParents) {
            if (!filter.where["and"]) {
                filter.where["and"] = [];
            }
            filter.where["and"].push({
                or: [
                    // parent id is null
                    {
                        parentId: null
                    },
                    // parent id is blank
                    {
                        parentId: ""
                    }
                ]
            })
        }
        return await common.gcFilter(filter);
    },

    /**
     * filter only parent(s)
     * @param filter
     * @return {Promise.<*>}
     */
    filterParentsOnly: (filter) => {
        filter.where["and"] = [{
            'or': [
                // parent id is null
                {
                    parentId: null
                },
                // parent id is blank
                {
                    parentId: ""
                }
            ]
        }]
        return filter;
    },

    /**
     * @description set one of locations as default
     * @param masters
     * @return : promise
     */
    setDefault: async (masters) => {
        try {
            let changeDefaultMaster = false;
            let defaultMaster = {};
            if (_.isArray(masters)) {
                defaultMaster = _.findWhere(masters, { isDefault: true });
            }
            else {
                defaultMaster = masters;
            }

            if (defaultMaster && defaultMaster.isDefault) {
                changeDefaultMaster = true;
            }
            else {
                return false
            }

            if (changeDefaultMaster) {
                let criteria = {

                    _id: {
                        $ne: ObjectId(defaultMaster.id)
                    },
                    isDefault: true
                };
                const update = { isDefault: false };
                if (defaultMaster.parentId && defaultMaster.parentId != null) {
                    criteria.parentId = ObjectId(defaultMaster.parentId)
                }
                else {
                    criteria.parentId = null;
                }


                return new Promise((resolve, reject) => {
                    let db = Master.getDatastore().manager;
                    let collection = db.collection(Master.tableName);
                    collection.update(
                        criteria,
                        // update is_read flag of exact match
                        {
                            $unset: update
                        },
                        // write concern required for use of above operator
                        {
                            multi: true,
                            writeConcern: { w: "majority", wtimeout: 5000 }
                        },
                        (err, result) => {
                            if (err) {
                                reject(new Error(err))
                            }
                            else {
                                resolve(true)
                            }
                        });

                })

            }
            else {
                return true
            }
        } catch (e) {
            console.log('e', e);
            throw new Error(e)
        }
    },

    /**
     * @description append update param(s)
     * @param options: "{
     *                      "params":<Object>,
     *                      "master":<Object>,
     *                 }"
     */
    appendUpdateParams: async (options) => {
        let params = options.params;
        let master = options.master;
        params = _.omit(params, [
            "parentId",
            "updatedAt",
            "createdAt"
        ])
        master = _.assignIn(master, params);
        return master;
    },

    /**
     * @description group master(s) by parent id
     * @param options "{ "masters":<Array>, "search":<string> }"
     * @param callback
     */
    groupByParent: async (options) => {
        let masters = options.masters;
        if (options
            && options.search) {
            const parents = _.map(masters, 'parentId');
            const filter = {
                where: {
                    id: {
                        'in': parents
                    }
                }
            };
            let parentMasters = await Master.find(filter);

            if (parentMasters && parentMasters.length) {
                let groupedMasters = _.map(parentMasters,
                    (parentMaster) => {
                        if (parentMaster) {
                            parentMaster.childs = _.filter(masters, { parentId: parentMaster.id })
                        }
                        return parentMaster;
                    });

                if (options
                    && options.search) {
                    const optionsModifySearch = {
                        search: options && options.search ? options.search : undefined,
                        masters: groupedMasters
                    };
                    return master.modifySearchResponse(optionsModifySearch)
                }
            }
            else {
                return masters
            }

        }
        else {
            return masters
        }

    },

    /**
     * @description
     * @param include: <Array>
     * @param query: <String>
     * @return {*}
     */
    includeReferences: async (include, query) => {
        if (include
            && include.length
            && _.includes(include, config.service.master.INCLUDE.subMasters)) {
            query.populate("subMasters", { where: { isActive: true, isDeleted: false } })
        }
        return query;
    },

    includeAllReferences: async (query) => {
        query.populate("subMasters", { where: { isActive: true } })

        return query;
    },


    /**
     * @description: formatting masters(s)
     * @param options "{
     *                      "masters":<Array>
     *                      "format":<Array>
     *                }"
     * @returns {Array}
     */
    formatRecords: (options) => {
        const isNeedDefaultFormat = options && !options.format;
        if (isNeedDefaultFormat) {
            options.format = config.service.master.DEFAULT_FORMAT;
        }
        return _.map(options.masters, (record) => {
            const isChild = record.subMasters && record.subMasters.length;
            if (isChild) {
                record.subMasters = master.formatRecords({
                    masters: record.subMasters,
                    format: options.format
                });
            }
            return master.formatRecord({
                master: record,
                format: options.format
            })
        })
    },

    /**
     * @description format single record
     * @param options
     * @return {Object}
     */
    formatRecord: (options) => {
        const isNeedDefaultFormat = options && !options.format;
        if (isNeedDefaultFormat) {
            options.format = config.service.master.DEFAULT_FORMAT;
        }
        return _.pick(options.master, options.format);


    },

    /**
     * @description: identify search of of master
     * @param options "{
     *                      "search":<Object>,
     *                      "masters":<Object>,
     *                }"
     */
    modifySearchResponse: async (options) => {
        let masters = options.masters;
        switch (options.search.toLowerCase()) {
            case config.services.master.SEARCH_COMMANDS.ACTIVE:
            case config.services.master.SEARCH_COMMANDS.IN_ACTIVE:
            case config.services.master.SEARCH_COMMANDS.DEFAULT:
                break;
            case config.services.master.SEARCH_COMMANDS.LATEST:
                masters = _.sortBy(masters, (master) => {
                    return master.childs ? _.sortBy(master.childs, ['createdAt', 'updatedAt']) : master.updatedAt;
                }).reverse();
                break;
            case config.services.master.SEARCH_COMMANDS.SEQUENCE_ASC:
                masters = _.sortBy(masters, (master) => {
                    if (master.childs) {
                        master.childs = _.sortBy(master.childs, ['sortingSequence'])
                    }
                    return master.sortingSequence;
                });
                break;
            case config.services.master.SEARCH_COMMANDS.SEQUENCE_DESC:
                masters = _.sortBy(masters, (master) => {
                    if (master.childs) {
                        master.childs = _.sortBy(master.childs, ['sortingSequence'])
                    }
                    return master.sortingSequence;
                }).reverse();
                break;
            case config.services.master.SEARCH_COMMANDS.NAME_ASC:
                masters = _.sortBy(masters, (master) => {
                    if (master.childs) {
                        master.childs = _.sortBy(master.childs, ['name'])
                    }
                    return master.name;
                });
                break;
            case config.services.master.SEARCH_COMMANDS.NAME_DESC:
                masters = _.sortBy(masters, (master) => {
                    if (master.childs) {
                        master.childs = _.sortBy(master.childs, ['name'])
                    }
                    return master.name;
                }).reverse();
                break;
            default:
                break;
        }

        return masters;
    },

    /**
     * @description: list master(s) by code
     * @return {Promise.<void>}
     */
    async listByCode(options) {
        try {
            let groupedMastersByCode = {};
            const isValid = masterValidation.validateListByCodeParams(options);
            if (!isValid) {
                return groupedMastersByCode;
            }
            let filter = {
                where: {
                    code: options.masters,
                    isActive: true
                }
            };

            // filter only parents
            filter = _.assign(filter, this.filterParentsOnly(filter));
            let query = Master.find(filter);

            // include references
            if (options.include
                && options.include.length
                && _.includes(options.include, sails.config.service.master.INCLUDE.subMasters)) {
                query = await this.includeReferences(options.include, query);
            }
            const masters = await query;
            if (masters && masters.length) {
                let formattedMasters = this.formatRecords({
                    masters: masters,
                    format: options.format ? options.format : undefined
                });

                let groupedMastersByCode = {};
                _.forEach(options.masters, (code) => {
                    const findByCode = _.find(formattedMasters, { code: code });
                    if (findByCode) {
                        findByCode.subMasters = _.sortBy(findByCode.subMasters, 'code')
                        groupedMastersByCode[code] = findByCode
                    }
                });

                return groupedMastersByCode
            }
            else {
                return groupedMastersByCode
            }
        }
        catch (err) {
            console.log("err", err);
            throw err
        }
    },

    syncRapPrice: async (options) => {
        try {
            let response = {
                lastUpdatedAt: '',
                maxRevisionNo: 0,
                combinationsCount: 0
            };
            let lastSyncRecord = await PriceList.find({}).sort('revisionNo DESC').limit(1);
            let lastRevisionNo = lastSyncRecord && lastSyncRecord.length > 0 ? lastSyncRecord[0].revisionNo : 0;
            if (lastRevisionNo) {
                let db = PriceList.getDatastore().manager;
                let query = [
                    {
                        $match: { revisionNo: lastRevisionNo }
                    },
                    {
                        $group:
                        {
                            _id: null,
                            count:
                            {
                                $sum: { $size: "$priceList" }
                            },
                            lastUpdatedAt: { $last: "$updatedAt" }
                        }
                    }
                ];

                await new Promise((resolve, reject) => {
                    db.collection(PriceList.tableName).aggregate(query, function (err, result) {
                        if (!err) {
                            result = _.first(result);
                            response.combinationsCount = result.count;
                            response.lastUpdatedAt = result.lastUpdatedAt;
                            response.maxRevisionNo = lastRevisionNo;
                            resolve(result)
                        }
                        else {
                            reject(err);
                        }
                    })
                });

            }

            return response
        }
        catch (err) {
            throw err
        }


    },

    syncDiscountPrice: async (options) => {
        try {
            let response = {
                lastUpdatedAt: '',
                count: 0
            };

            /*  response.count          = await  DiscountPrice.count({});
              let lastUpdatedAtFilter = {limit: 1, sort: {updatedAt: -1}};
              let lastUpdatedAt       = await DiscountPrice.find(lastUpdatedAtFilter);
              response.lastUpdatedAt  = lastUpdatedAt[0].updatedAt;*/

            let db = DiscountPrice.getDatastore().manager;
            let query = [
                {
                    $match: { _id: { $ne: null } }
                },
                {
                    $group:
                    {
                        _id: null,
                        combinationsCount:
                        {
                            $sum: { $size: "$discountList" }
                        },
                        count: {
                            $sum: 1
                        },
                        lastUpdatedAt: { $last: "$updatedAt" }
                    }
                }
            ];

            await new Promise((resolve, reject) => {
                db.collection(DiscountPrice.tableName).aggregate(query, function (err, result) {
                    if (!err) {
                        result = _.first(result);
                        response.combinationsCount = result.combinationsCount;
                        response.count = result.count;
                        response.lastUpdatedAt = result.lastUpdatedAt;
                        resolve(result)
                    }
                    else {
                        reject(err);
                    }
                })
            });
            return response
        }
        catch (err) {
            throw err
        }


    },

    syncLabourCharge: async (options) => {
        try {
            let response = {
                lastUpdatedAt: '',
                count: 0
            };

            response.count = await LabourCharge.count({});
            let lastUpdatedAtFilter = { limit: 1, sort: { updatedAt: -1 } };
            let lastUpdatedAt = await LabourCharge.find(lastUpdatedAtFilter);
            response.lastUpdatedAt = lastUpdatedAt[0].updatedAt;
            return response
        }
        catch (err) {
            throw err
        }


    },

    /**
     * @description: set default master(s) after create
     * @param masters
     * @param cb
     */
    async afterCreate(masters) {
        await this.setDefault(masters);
    },

    /**
     * @description: set default master(s) after update
     * @param masters
     * @param: cb
     */
    async afterUpdate(masters) {
        await this.setDefault(masters);
    },

    afterDestroy: async (masters, cb) => {
        if (masters && masters.length || masters && masters.id) {
            let options = {
                module: Master.identity,
                records: typeof masters === 'object' ? [masters] : masters
            };
            await deleteSyncService.logDeletedRecords(options);
            return cb();
        }
        else {
            return cb();
        }


    }
};
