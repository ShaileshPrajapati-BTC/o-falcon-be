'use strict';

const common = require(sails.config.appPath + '/api/services/common');
const config = require(sails.config.appPath + '/config/constant/version');
const ObjectId = require('mongodb').ObjectID;
const _ = require('lodash');
module.exports = {
    /**
     *  @description: getting query
     * @param options=params
     * @returns {Promise.<*>}
     */
    getFilter: async options => {
        let filter = await common.getFilter(options);

        //sorting
        // sort by request
        if (options.sort) {
            filter.sort = options.sort;
        } else {
            filter.sort = [{ createdAt: 'DESC' }, { updatedAt: 'DESC' }];
        }

        if (options.type) {
            filter.where['type'] = options.type;
        }
        return await common.gcFilter(filter);
    },

    /**
     * @description append update param(s)
     * @param options: "{
     *                      "params":<Object>,
     *                      "meal":<Object>,
     *                 }"
     */
    appendUpdateParams: async (data, params) => {
        data = _.assignIn(data, _.omit(params, ['id']));
        return data;
    },

    /**
     * @description
     * @param include: <Array>
     * @param query: <String>
     * @return {*}
     */
    includeReferences: async (include, query) => {
        if (include && include.length) {
            if (_.includes(include, config.service.version.INCLUDES.CREATED_BY)) {
                query.populate('created_by');
            }
            if (_.includes(include, config.service.version.INCLUDES.UPDATED_BY)) {
                query.populate('updated_by');
            }
            return await query;
        } else {
            return await query;
        }
    },

    /**
     * @description: formatting masters(s)
     * @param options "{
     *                      "masters":<Array>
     *                      "format":<Array>
     *                }"
     * @returns {Array}
     */
    formatRecords: options => {
        const isNeedDefaultFormat = options && !options.format;
        if (isNeedDefaultFormat) {
            options.format = config.service.meal.DEFAULT_FORMAT;
        }
        return _.map(options.masters, record => {
            const isChild = record.subMasters && record.subMasters.length;
            if (isChild) {
                record.subMasters = meal.formatRecords({
                    masters: record.subMasters,
                    format: options.format
                });
            }
            return meal.formatRecord({
                meal: record,
                format: options.format
            });
        });
    },

    /**
     * @description format single record
     * @param options
     * @return {Object}
     */
    formatRecord: options => {
        const isNeedDefaultFormat = options && !options.format;
        if (isNeedDefaultFormat) {
            options.format = config.service.meal.DEFAULT_FORMAT;
        }
        return _.pick(options.meal, options.format);
    },

    /**
     * @description: identify search of of meal
     * @param options "{
     *                      "search":<Object>,
     *                      "masters":<Object>,
     *                }"
     */
    modifySearchResponse: async options => {
        let masters = options.masters;
        switch (options.search.toLowerCase()) {
            case config.services.meal.SEARCH_COMMANDS.ACTIVE:
            case config.services.meal.SEARCH_COMMANDS.IN_ACTIVE:
            case config.services.meal.SEARCH_COMMANDS.DEFAULT:
                break;
            case config.services.meal.SEARCH_COMMANDS.LATEST:
                masters = _.sortBy(masters, meal => {
                    return meal.childs ? _.sortBy(meal.childs, ['createdAt', 'updatedAt']) : meal.updatedAt;
                }).reverse();
                break;
            case config.services.meal.SEARCH_COMMANDS.SEQUENCE_ASC:
                masters = _.sortBy(masters, meal => {
                    if (meal.childs) {
                        meal.childs = _.sortBy(meal.childs, ['sortingSequence']);
                    }
                    return meal.sortingSequence;
                });
                break;
            case config.services.meal.SEARCH_COMMANDS.SEQUENCE_DESC:
                masters = _.sortBy(masters, meal => {
                    if (meal.childs) {
                        meal.childs = _.sortBy(meal.childs, ['sortingSequence']);
                    }
                    return meal.sortingSequence;
                }).reverse();
                break;
            case config.services.meal.SEARCH_COMMANDS.NAME_ASC:
                masters = _.sortBy(masters, meal => {
                    if (meal.childs) {
                        meal.childs = _.sortBy(meal.childs, ['name']);
                    }
                    return meal.name;
                });
                break;
            case config.services.meal.SEARCH_COMMANDS.NAME_DESC:
                masters = _.sortBy(masters, meal => {
                    if (meal.childs) {
                        meal.childs = _.sortBy(meal.childs, ['name']);
                    }
                    return meal.name;
                }).reverse();
                break;
            default:
                break;
        }

        return masters;
    },
    /**
     * check duplicate key
     * @param params
     * @param key
     * @returns {Promise.<boolean>}
     */
    async checkDuplication(params) {
        try {
            let filter = {
                where: {
                    number: params.number,
                    platform: params.platform
                }
            };
            //filter.where[key] = params[key]
            if (params.id) {
                filter.where.id = { '!=': params.id };
            }
            let version = await Version.findOne(filter.where);
            if (version) return true;
            else return false;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
};
