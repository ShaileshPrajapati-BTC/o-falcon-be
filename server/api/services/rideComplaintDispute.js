const moment = require('moment');
const uuid = require('uuid');
const ObjectId = require('mongodb').ObjectID;
const SeriesGeneratorService = require('./seriesGenerator');
const common = require(`./common`);

module.exports = {
    /**
     * @description: getting filter of ride complaint dispute master
     * @param options
     * @param callback
     */
    async getFilter(options) {
        let filter = await common.getFilter(options);

        // filter by status
        if (options.status) {
            filter.where.status = options.status;
        }

        if (options.rideId) {
            filter.where.rideId = options.rideId;
        }

        // filter by userId
        if (options.userIds) {
            filter.where.userId = { in: options.userIds };
        }

        if (options.userId) {
            filter.where.userId = options.userId;
        }

        if (options.dateRange && options.dateRange.from && options.dateRange.to) {
            filter.where.createdAt = {
                '>=': options.dateRange.from,
                '<=': options.dateRange.to
            };
        }

        const newFilter = await common.gcFilter(filter);

        return newFilter;
    },

    /**
     * @desc : Getting count status wise
     * @param option
     * @returns {Promise.<boolean>}
     */
    async getStatusWiseCount(option) {
        try {
            if (option.rideId) {
                option.rideId = ObjectId(option.rideId);
            }
            if (option.createdAt) {
                let createdAtFilter = {};
                _.each(option.createdAt, (v, k) => {
                    if (k == '>=') {
                        createdAtFilter.$gte = v;
                    } else if (k == '<=') {
                        createdAtFilter.$lte = v;
                    }

                });
                option.createdAt = createdAtFilter;
            }

            option = common.getAggregateFilter(option);

            let db = await RideComplaintDispute.getDatastore().manager;

            return await new Promise(async (resolve, reject) => {

                db.collection('RideComplaintDispute')
                    .aggregate([
                        { $match: option },
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        }
                    ])
                    .toArray((err, statusWiseCount) => {
                        if (err) {
                            reject(err);
                        } else {


                            let countByStatus = [];
                            _.each(statusWiseCount, (count) => {
                                if (count && count._id) {
                                    let status = count._id ? _.cloneDeep(count._id) : null;
                                    let statusCountObj = _.find(countByStatus, { status: status });
                                    if (statusCountObj) {
                                        statusCountObj.status = status;
                                        statusCountObj['count'] += count.count;
                                    } else {
                                        let countObj = {
                                            status: status,
                                            count: count.count
                                        };
                                        countByStatus.push(countObj);
                                    }

                                    delete count._id;
                                }
                            });
                            resolve(countByStatus);
                        }
                    });
            });
        } catch (err) {
            return false;
        }
    },

    // add new  raise ride Complaint , dispute
    async create(params) {
        try {
            if (params.actionQuestionnaireId) {
                let actionQuestions = await ActionQuestionnaireMaster
                    .findOne({ id: params.actionQuestionnaireId });
                params.type = actionQuestions && actionQuestions.type ?
                    actionQuestions.type :
                    0;
                params.question = actionQuestions && actionQuestions.question ?
                    actionQuestions.question :
                    null;
            }

            let remark = null;
            if (params.type === sails.config.COMPLIANT_DISPUTE.TYPE.PROBLEM) {
                remark = 'Complaint raise';
            } else if (params.type === sails.config.COMPLIANT_DISPUTE.TYPE.DISPUTE) {
                remark = 'Dispute raise';
            } else if (params.type === sails.config.COMPLIANT_DISPUTE.TYPE.SERVICE_REQUEST) {
                remark = 'Service request raise';
            }

            if (params.attachments && params.attachments.length) {
                _.each(params.attachments, (attachment) => {
                    attachment.attachmentId = uuid();
                });
            }

            params.statusTrack = [{
                status: sails.config.COMPLIANT_DISPUTE.STATUS.SUBMITTED,
                dateTime: moment().toISOString(),
                userId: params.loginUser && params.loginUser.id ? params.loginUser.id : null,
                remark: remark
            }];
            params.status = sails.config.COMPLIANT_DISPUTE.STATUS.SUBMITTED;
            params.remark = remark;
            if(params.loginUser) {
                params.userId=params.loginUser.id;
                params.userType=params.loginUser.type;
            }

            if(params.rideId){
                let ride=await RideBooking.findOne({
                    where:{id:params.rideId},
                    select:['franchiseeId']
                });
                if(ride && ride.franchiseeId) {
                    params.franchiseeId = ride.franchiseeId;
                }
            }
            let rideComplaintDispute = await RideComplaintDispute.create(params).fetch();
            // for sync purpose
            // await RideRequest.update({id: params.rideId}, {updatedAt: new Date()});
            // let ride = await RideRequestService.rideDetail(params.rideId, params.userId);

            return rideComplaintDispute;
        } catch (e) {
            throw new Error(e);
        }
    },

    async list(filter) {
        try {
            let records = await RideComplaintDispute
                .find(filter)
                .populate('userId')
                .populate('rideId')
                .meta({ enableExperimentalDeepTargets: true });

            let response = { list: records };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await RideComplaintDispute.count(countFilter).meta({ enableExperimentalDeepTargets: true });

            return response;
        } catch (e) {
            throw new Error(e);
        }
    },

    async cancelComplaintDispute(params) {
        try {
            // find record

            let rideComplaintDispute = await RideComplaintDispute.findOne({ id: params.id })
                .populate('rideId');
            if (rideComplaintDispute && rideComplaintDispute.id) {

                rideComplaintDispute.statusTrack.push({
                    status: sails.config.COMPLIANT_DISPUTE.STATUS.CANCELLED,
                    dateTime: moment().toISOString(),
                    userId: params.loginUser && params.loginUser.id ? params.loginUser.id : null,
                    remark: params.remark ? params.remark : null
                });
                let update = {
                    status: sails.config.COMPLIANT_DISPUTE.STATUS.CANCELLED,
                    remark: params.remark ? params.remark : null,
                    statusTrack: rideComplaintDispute.statusTrack
                };
                let updatedRecords = await RideComplaintDispute.update({ id: params.id }, update).fetch();
                // for sync purpose
                // await RideRequest.update({ id: rideComplaintDispute.rideId.id }, { updatedAt: new Date() });
                if (updatedRecords && updatedRecords.length) {
                    updatedRecords[0].rideId = rideComplaintDispute.rideId;

                    return updatedRecords[0];
                }

                return false;
            }

        } catch (e) {
            throw new Error(e);
        }
    },

    async view(params) {
        try {
            let rideComplaintDispute = await RideComplaintDispute
                .findOne({ id: params.id })
                .populate('userId')
                .populate('rideId');

            return { flag: true, data: rideComplaintDispute };
        } catch (e) {
            throw new Error(e);
        }
    },
    async beforeCreate(ride, cb) {
        try {
            let series = await SeriesGeneratorService.nextSeriesGenerate({
                type: sails.config.SERIES_GENERATOR.TYPE.RIDE_COMPLAINT_DISPUTE_SERIES
            });
            ride.uniqNumber = series.series;
        } catch (e) {
            throw new Error('failed to create ride complaint dispute.');
        }
        cb();
    },
    afterCreate: async function () {
    },
    afterUpdate: async function () {
    },
    afterDestroy: async function () {
    }

};
