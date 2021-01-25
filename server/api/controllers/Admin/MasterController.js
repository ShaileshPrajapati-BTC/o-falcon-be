/**
 * MasterController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const masterService = require(`${sails.config.appPath}/api/services/master`);
const util = require(`${sails.config.appPath}/api/services/util`);
const masterValidation = require(`${sails.config.appPath}/api/services/masterValidation`);
const config = require(`${sails.config.appPath}/config/constant/master`);
const modelName = 'master';
module.exports = {

    async listBySearch(req, res) {
        const params = _.omit(req.allParams(), 'id');
        try {
            // get filter
            let filter = await masterQueryBuilder.getFilter(params);

            // find masters
            let masters = await Master.find(filter);

            // group records
            let options = {
                masters: masters,
                search: params && params.search ? params.search : undefined
            };

            let groupedMasters = masterService.groupByParent(options);

            const response = masterService.formatRecords({ masters: groupedMasters });

            return res.ok(response, sails.config.message.OK);

        } catch (err) {
            return res.serverError({}, err);
        }
    },

    /**
     * @description: list master(s) by paginate
     * @return {Promise.<void>}
     */
    async paginate(req, res) {
        const params = _.omit(req.allParams(), 'id');
        try {
            let filter = await masterService.getFilter(params);
            if (filter) {
                let query = Master.find(filter);

                // include references
                if (params.include &&
                    params.include.length &&
                    _.includes(params.include, sails.config.service.master.INCLUDE.subMasters)) {
                    querry = await masterService.includeReferences(params.include, query);
                }
                const masters = await query;
                if (masters && masters.length) {
                    const response = masterService.formatRecords({ masters: masters });

                    return res.ok(response, sails.config.message.OK);
                }

                return res.ok([], sails.config.message.NOT_FOUND);
            }
        } catch (err) {
            console.log('err', err);

            return res.serverError({}, err);
        }
    },

    async allMasterList(req, res) {
        try {
            let filter = {
                where: {
                    isActive: true
                }
            };

            // filter only parents
            filter = _.assign(filter, masterService.filterParentsOnly(filter));
            let query = Master.find(filter);

            // include references
            query = await masterService.includeAllReferences(query);
            const masters = await query;

            if (masters && masters.length) {
                let formattedMasters = masterService.formatRecords({
                    masters: masters
                });
                let groupedMastersByCode = {};
                _.forEach(formattedMasters, (master) => {
                    const findByCode = _.find(formattedMasters, { code: master.code });
                    if (findByCode) {
                        findByCode.subMasters = _.sortBy(findByCode.subMasters, function (v) {
                            return v.sortingSequence;
                        });

                        groupedMastersByCode[master.code] = findByCode
                    }
                });

                return res.ok(groupedMastersByCode, sails.config.message.OK)
            }

            return res.notFound(null, sails.config.message.NOT_FOUND)

        }
        catch (err) {
            console.log("err", err);
            return res.serverError({}, err);
        }
    },


    /**
     * @description: list master(s) by code
     * @return {Promise.<void>}
     */
    async listByCode(req, res) {
        const params = _.omit(req.allParams(), 'id');
        try {
            const isValid = masterValidation.validateListByCodeParams(params);
            if (!isValid) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let filter = {
                where: {
                    code: params.masters,
                    isActive: true
                }
            };

            // filter only parents
            filter = _.assign(filter, masterService.filterParentsOnly(filter));
            let query = Master.find(filter);

            // include references
            if (params.include
                && params.include.length
                && _.includes(params.include, sails.config.service.master.INCLUDE.subMasters)) {
                query = await masterService.includeReferences(params.include, query);
            }
            const masters = await query;
            if (masters && masters.length) {
                let formattedMasters = masterService.formatRecords({
                    masters: masters
                });

                let groupedMastersByCode = {};
                _.forEach(params.masters, (code) => {
                    const findByCode = _.find(formattedMasters, { code: code });
                    if (findByCode) {
                        findByCode.subMasters = _.sortBy(findByCode.subMasters, function (v) {
                            return v.sortingSequence;
                        });
                        if (params.customSort) {
                            findByCode.subMasters = _.sortBy(findByCode.subMasters, function (v) {
                                return parseInt(v.code);
                            });
                        }
                        groupedMastersByCode[code] = findByCode
                    }
                });

                return res.ok(groupedMastersByCode, sails.config.message.OK)
            }

            return res.notFound(null, sails.config.message.NOT_FOUND)

        }
        catch (err) {
            console.log("err", err);
            return res.serverError({}, err);
        }
    },

    /**
     * @description crete master
     */
    async create(req, res) {
        const params = _.omit(req.allParams(), 'id');
        try {

            const isValid = masterValidation.validateRequiredCreateParams(params);
            if (!isValid) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            else {
                const isValid = await masterValidation.validateName(params);
                if (!isValid) {
                    return res.badRequest(null, sails.config.message.NAME_ALREADY_EXISTS);
                }
                else {
                    const isValid = masterValidation.ValidateInActiveDefault(params);
                    if (!isValid) {
                        return res.badRequest(null, sails.config.message.SET_IN_ACTIVE_MASTER_AS_DEFAULT);
                    }
                    else {
                        params.slug = util.slugify(params.name);
                        params.normalizeName = params.name.toLowerCase();
                        let maxSequence = await Master.find({
                            where: { id: { '!=': null } },
                            select: ['sortingSequence'],
                            limit: 1,
                            sort: 'sortingSequence DESC'
                        });
                        if (maxSequence && maxSequence.length) {
                            params.sortingSequence = _.first(maxSequence).sortingSequence + 1;
                        }
                        let createdMaster = await Master.create(params).fetch();
                        if (createdMaster && createdMaster.id) {
                            let message = '';
                            message = createdMaster && !_.isNull(createdMaster.parentId) ? sails.config.message.SUB_MASTER_CREATED : sails.config.message.MASTER_CREATED;
                            return res.ok(createdMaster, message)
                        }

                        return res.serverError(null, { message: sails.config.message.FAILED_TO_CREATE_MASTER })


                    }
                }
            }

        }
        catch (err) {
            console.log("err", err);
            return res.serverError({}, err);
        }
    },

    /**
     * @description update master
     */
    async update(req, res) {
        const params = req.allParams();
        try {
            const isValid = masterValidation.validateRequiredUpdateParams(params);
            if (!isValid) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            else {
                let options = _.cloneDeep(params);
                options.exceptId = params.id;
                const isValid = await masterValidation.validateName(options);
                if (!isValid) {
                    return res.badRequest(null, sails.config.message.NAME_ALREADY_EXISTS);
                }
                else {
                    const isValid = masterValidation.ValidateInActiveDefault(params);
                    if (!isValid) {
                        return res.badRequest(null, sails.config.message.SET_IN_ACTIVE_MASTER_AS_DEFAULT);
                    }

                    const filter = {
                        id: params.id
                    };

                    let master = await Master.findOne(filter);
                    if (master && master.id) {
                        params && params.name ? params.slug = util.slugify(params.name) : '';
                        params && params.name ? params.normalizeName = params.name.toLowerCase() : '';
                        let response = await Master.update({ id: master.id }, params).fetch();
                        if (response && response.length) {
                            let updatedMaster = _.first(response);
                            let message = updatedMaster && !_.isNull(updatedMaster.parentId) ? sails.config.message.SUB_MASTER_UPDATED : sails.config.message.MASTER_UPDATED;
                            return res.ok(updatedMaster, message)
                        }
                    }
                    else {
                        return res.serverError(null, { message: sails.config.message.FAILED_TO_UPDATE_MASTER })
                    }


                }
            }
        }
        catch (err) {
            console.log("Err", err);
            return res.serverError({}, err);
        }
    },

    /**
     * @description updating sequence of multiple master(s)
     */
    async bulkActivate(req, res) {
        const params = req.allParams();
        try {
            console.log("-1");
            const isValid = masterValidation.validateRequiredActivateParams(params);
            if (!isValid) return res.badRequest(null, sails.config.message.BAD_REQUEST);

            let filter = {
                id: { 'in': params.masters }
            };
            let masters = await Master.find(filter);
            if (masters && masters.length) {

                try {
                    console.log("1", filter);
                    let response = await Master.update(filter, { isActive: params.isActive }).fetch();
                    if (params.isActive == false) {
                        let defaultMaster = _.find(masters, { isDefault: true });
                        if (defaultMaster && defaultMaster.name) {
                            let removeDefaultFromMaster = await Master.update({ id: defaultMaster.id },
                                {
                                    isDefault: false,
                                    updatedBy: params.updatedBy
                                }
                            );
                            let index = _.findIndex(response, { id: defaultMaster.id });
                            if (index > -1) {
                                response[index] = _.first(removeDefaultFromMaster)
                            }
                        }
                    }
                    const message = "Value(s) " + (params.isActive ? " activated " : " de-activated ") + " successfully. ";
                    return res.ok(_.map(masters, 'id'), { message: message })


                } catch (e) {
                    return { error: e, message: sails.config.message.FAILED_TO_UPDATE_ALL_RECORDS }
                }


            }


        }
        catch (err) {
            return res.serverError({}, err);
        }
    },

    /**
     * @description : set multiple masters as default
     */
    async setDefault(req, res) {
        try {
            const params = req.allParams();
            if (!params
                || !_.has(params, 'isDefault')
                || !params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }


            let filter = {
                id: params.id

            };
            let master = await Master.findOne(filter);
            if (master) {
                if (params.isDefault && !master.isActive) {
                    return res.ok([], sails.config.message.SET_IN_ACTIVE_MASTER_AS_DEFAULT);
                }

                master.isDefault = params.isDefault;
                await Master.update({ id: params.id }, { isDefault: params.isDefault, updatedBy: params.updatedBy }).fetch();
                return res.ok({ id: master.id }, sails.config.message.MASTER_UPDATED)


            }
            else {
                return res.serverError(null, sails.config.message.NOT_FOUND)
            }

        } catch (err) {
            console.log("err", err);
            return res.serverError({}, err);
        }

    },
    /**
     * @description updating sequence of multiple master(s)
     */
    async bulkSequenceUpdate(req, res) {
        const params = req.allParams();
        let updatedMasters = [];

        try {
            const isValid = masterValidation.validateRequiredSequenceUpdateParams(params);
            if (!isValid) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let filter = {
                id: { 'in': _.map(params.sequences, 'id') }
            };
            let masters = await Master.find(filter);
            if (masters && masters.length) {
                for (let master of masters) {
                    const findSequence = _.find(params.sequences, { id: master.id });
                    if (findSequence) {
                        master.sortingSequence = findSequence.sequence;
                        master.updatedBy = params.updatedBy;
                        let response = await Master.update({ id: master.id }).set(master).fetch();
                        updatedMasters.push(_.first(response))
                    }
                }

                return res.ok(masterService.formatRecords({ masters: updatedMasters }), sails.config.message.OK)
            }
            else {
                return res.serverError(null, sails.config.message.NOT_FOUND)
            }


        }
        catch (err) {
            return res.serverError({}, err);
        }
    },
    /**
     * @description view master
     */
    async view(req, res) {
        const params = req.allParams();
        try {

            if (!params.id) {
                return res.badRequest({}, sails.config.message.BAD_REQUEST);
            }

            let master = await Master.findOne({
                id: params.id
            });
            console.log('master', master);
            if (master && master.id) {
                return res.ok(master, sails.config.message.OK);
            }
            else {
                return res.badRequest({}, sails.config.message.NOT_FOUND);
            }

        }
        catch (err) {
            return res.serverError({}, err);
        }


    }


};

