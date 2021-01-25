const moment = require('moment');
const rideComplaintDisputeService = require(`${sails.config.appPath}/api/services/rideComplaintDispute`);
const SeriesGeneratorService = require(`${sails.config.appPath}/api/services/seriesGenerator`);


module.exports = {


    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);

            if (params.dateRange && params.dateRange.from && params.dateRange.to) {
                filter.where.createdAt = {
                    '>=': params.dateRange.from,
                    '<=': params.dateRange.to
                };
            }

            let recordsList = await RideComplaintDispute.find(filter)
                .populate('rideId')
                // eslint-disable-next-line max-len
                .populate('userId', { select: ['name', 'firstName', 'lastName', 'mobiles', 'emails', 'image'] })
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name'] })
                .meta({ enableExperimentalDeepTargets: true });
            if (!recordsList.length) {
                return res.ok(
                    {
                        count: 0,
                        list: []
                    },
                    sails.config.message.LIST_NOT_FOUND);
            }

            // populate status track user detail
            let userIds = _.compact(_.uniq(_.map(_.flattenDeep(_.map(recordsList, 'statusTrack')), 'userId')));
            let userIdsForConversation = _.compact(_.uniq(_.map(_.flattenDeep(_.map(recordsList, 'conversationTrack')), 'userId')));
            let userIdsForActivityLog = _.compact(_.uniq(_.map(_.flattenDeep(_.map(recordsList, 'activityTrack')), 'userId')));
            if (userIds && userIds.length) {
                let users = await User.find({ where: { id: userIds } });
                let usersForConversation = await User.find({ where: { id: userIdsForConversation } });
                let userForActivityLog = await User.find({ where: { id: userIdsForActivityLog } });
                if (users && users.length) {
                    _.forEach(recordsList, (record) => {
                        if (record.statusTrack && record.statusTrack.length) {
                            record.statusTrack = _.map(record.statusTrack, (track) => {
                                track.userId = _.find(users, { id: track.userId });
                                track.userId = _.pick(track.userId, ['id', 'name', 'firstName', 'lastName', 'emails', 'mobiles']);

                                return track;
                            });
                        }
                        if (record.conversationTrack && record.conversationTrack.length) {
                            record.conversationTrack = _.map(record.conversationTrack, (track) => {
                                track.userId = _.find(usersForConversation, { id: track.userId });
                                track.userId = _.pick(track.userId, ['id', 'name', 'firstName', 'lastName', 'emails', 'mobiles']);

                                return track;
                            });
                        }
                        if (record.activityTrack && record.activityTrack.length) {
                            record.activityTrack = _.map(record.activityTrack, (track) => {
                                track.userId = _.find(userForActivityLog, { id: track.userId });
                                track.userId = _.pick(track.userId, ['id', 'name']);
                                return track;
                            });
                        }
                    });
                }
            }

            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await RideComplaintDispute.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async statusUpdate(req, res) {
        try {
            const params = req.allParams();
            let loginUser = req.user;
            let success = [];
            if (!params || !params.disputeIds || !params.status) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let obj = {
                mail: {
                    template: 'common',
                    subject: '',
                    message: ''
                },
                pushNotification: {
                    data: {},
                    content: ''
                },
                sms: { content: '' },
                action: sails.config.SETTINGS.ACTIONS['SERVICE_REQUEST']
            };
            await Promise.all(_.map(params.disputeIds, async (disputeId) => {
                // find record
                let dispute = await RideComplaintDispute.findOne({ id: disputeId.id });
                if (dispute && dispute.id) {
                    // Add status track
                    dispute.statusTrack.push({
                        status: params.status,
                        dateTime: moment().toISOString(),
                        userId: loginUser && loginUser.id ? loginUser.id : null,
                        remark: disputeId.remark ? disputeId.remark : null
                    });
                    // Add activity log
                    dispute.activityTrack.push({
                        dateTime: moment().toISOString(),
                        userId: loginUser && loginUser.id ? loginUser.id : null,
                        keyName: "status",
                        oldValues: dispute.status,
                        newValues: params.status
                    });
                    let update = {
                        status: params.status,
                        remark: disputeId.remark ? disputeId.remark : null,
                        statusTrack: dispute.statusTrack,
                        activityTrack: dispute.activityTrack,
                        updatedBy: loginUser.id
                    };
                    params.updateFilter.id = dispute.id;
                    let updatedRecords = await RideComplaintDispute.update(params.updateFilter, update).fetch();

                    let ridebooking = await RideBooking.findOne({ where: { id: dispute.rideId }, select: ['rideNumber'] });
                    /**  send notification **/
                    if (ridebooking) {
                        if (params.status === sails.config.COMPLIANT_DISPUTE.STATUS.IN_PROCESS) {
                            obj.mail.message = `Dispute for ride ${ridebooking.rideNumber} has been proceed.`;
                        } else if (params.status === sails.config.COMPLIANT_DISPUTE.STATUS.RESOLVED) {
                            obj.mail.message = `Dispute for ride ${ridebooking.rideNumber} has been resolved.`;
                        } else if (params.status === sails.config.COMPLIANT_DISPUTE.STATUS.CANCELLED) {
                            obj.mail.message = `Dispute for ride ${ridebooking.rideNumber} has been cancelled.`;
                        }
                    } else {
                        if (params.status === sails.config.COMPLIANT_DISPUTE.PRIORITY.URGENT) {
                            obj.mail.message = `Service request dispute has been proceed.`;
                        } else if (params.status === sails.config.COMPLIANT_DISPUTE.PRIORITY.HIGH) {
                            obj.mail.message = `Service request dispute has been proceed.`;
                        } else if (params.status === sails.config.COMPLIANT_DISPUTE.PRIORITY.MEDIUM) {
                            obj.mail.message = `Service request dispute has been proceed.`;
                        }
                    }

                    obj.pushNotification.content = obj.mail.message;
                    obj.sms.content = obj.mail.message;

                    /** send notification  **/
                    if (updatedRecords && updatedRecords.length) {
                        // await common.sendMailSMSAndPushNotification(obj);
                        let updatedRecord = _.first(updatedRecords);
                        success.push(updatedRecord.id);
                    }
                }

                return disputeId;
            }));

            return res.ok(success, sails.config.message.DISPUTE_STATUS_UPDATED);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }

    },

    // add new  raise ride Complaint , dispute
    async addServiceRequest(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        try {
            // required params check
            if (!params || !params.actionQuestionnaireId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            if (loggedInUser.type == sails.config.USER.TYPE.DEALER) {
                params.franchiseeId = loggedInUser.franchiseeId;
                params.dealerId = loggedInUser.id;
            }
            params.loginUser = loggedInUser;
            params.userType = loggedInUser.type;
            let newRequest = [];
            newRequest.push({
                dateTime: moment().toISOString(),
                userId: loggedInUser && loggedInUser.id ? loggedInUser.id : null,
                keyName: 'New Service request.',
                oldValues: null,
                newValues: null
            });
            params.activityTrack = newRequest;
            params.conversationTrack = [];
            // Generate series for serviceNo.
            let series = await SeriesGeneratorService.nextSeriesGenerate({
                type: sails.config.SERIES_GENERATOR.TYPE.SERVICE_REQUEST_SERIES
            });
            params.serviceNo = series.series;
            // create new entry in collection
            let createdRecord = await rideComplaintDisputeService.create(params);
            let messageType = createdRecord.type === sails.config.COMPLIANT_DISPUTE.TYPE.SERVICE_REQUEST ?
                'RIDE_COMPLAINT_CREATED' :
                'SERVICE_REQUEST_CREATED';
            if (createdRecord) {
                return res.ok(createdRecord,
                    sails.config.message[messageType]
                );
            }

            return res.serverError({}, sails.config.message.RIDE_COMPLAINT_DISPUTE_CREATED_CREATE_FAILED);
        } catch (e) {
            throw new Error(e);
        }
    },

    async priorityUpdate(req, res) {
        try {
            const params = req.allParams();
            let loginUser = req.user;
            let success = [];

            if (!params || !params.disputeIds || !params.priority) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let obj = {
                mail: {
                    template: 'common',
                    subject: '',
                    message: ''
                },
                pushNotification: {
                    data: {},
                    content: ''
                },
                sms: { content: '' },
                action: sails.config.SETTINGS.ACTIONS['SERVICE_REQUEST']
            };
            await Promise.all(_.map(params.disputeIds, async (disputeId) => {
                // find record
                let dispute = await RideComplaintDispute.findOne({ id: disputeId.id });
                if (dispute && dispute.id) {
                    //Add status track
                    dispute.statusTrack.push({
                        priority: params.priority,
                        dateTime: moment().toISOString(),
                        userId: loginUser && loginUser.id ? loginUser.id : null,
                        remark: disputeId.remark ? disputeId.remark : null
                    });
                    // Add activity log
                    dispute.activityTrack.push({
                        dateTime: moment().toISOString(),
                        userId: loginUser && loginUser.id ? loginUser.id : null,
                        keyName: "priority",
                        oldValues: dispute.priority,
                        newValues: params.priority
                    });
                    let update = {
                        priority: params.priority,
                        remark: disputeId.remark ? disputeId.remark : null,
                        statusTrack: dispute.statusTrack,
                        activityTrack: dispute.activityTrack,
                        updatedBy: loginUser.id
                    };
                    params.updateFilter.id = dispute.id;
                    let updatedRecords = await RideComplaintDispute.update(params.updateFilter, update).fetch();

                    /**  send notification **/
                    let ridebooking = await RideBooking.findOne({ where: { id: dispute.rideId }, select: ['rideNumber'] });
                    /**  send notification **/
                    if (ridebooking) {
                        if (params.priority === sails.config.COMPLIANT_DISPUTE.PRIORITY.URGENT) {
                            obj.mail.message = `Service request adds an urgent priority dispute for ride ${ridebooking.rideNumber}.`;
                        } else if (params.priority === sails.config.COMPLIANT_DISPUTE.PRIORITY.HIGH) {
                            obj.mail.message = `Service request adds an high priority dispute ride ${ridebooking.rideNumber}.`;
                        } else if (params.priority === sails.config.COMPLIANT_DISPUTE.PRIORITY.MEDIUM) {
                            obj.mail.message = `Service request adds an medium priority dispute ride ${ridebooking.rideNumber}.`;
                        } else if (params.priority === sails.config.COMPLIANT_DISPUTE.PRIORITY.LOW) {
                            obj.mail.message = `Service request adds an low priority dispute ride ${ridebooking.rideNumber}.`;
                        }
                    } else {
                        if (params.priority === sails.config.COMPLIANT_DISPUTE.PRIORITY.URGENT) {
                            obj.mail.message = `Service request dispute adds an urgent priority.`;
                        } else if (params.priority === sails.config.COMPLIANT_DISPUTE.PRIORITY.HIGH) {
                            obj.mail.message = `Service request dispute adds an high priority.`;
                        } else if (params.priority === sails.config.COMPLIANT_DISPUTE.PRIORITY.MEDIUM) {
                            obj.mail.message = `Service request dispute adds an medium priority.`;
                        } else if (params.priority === sails.config.COMPLIANT_DISPUTE.PRIORITY.LOW) {
                            obj.mail.message = `Service request dispute adds an low priority.`;
                        }
                    }

                    obj.pushNotification.content = obj.mail.message;
                    obj.sms.content = obj.mail.message;
                    obj.users = [disputeId.userId];
                    if (updatedRecords && updatedRecords.length) {
                        // await common.sendMailSMSAndPushNotification(obj);
                        let updatedRecord = _.first(updatedRecords);
                        success.push(updatedRecord.id);
                    }
                }

                return disputeId;
            }));

            return res.ok(success, sails.config.message.DISPUTE_PRIORITY_UPDATED);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async sendConversation(req, res) {
        try {
            const params = req.allParams();
            let loginUser = req.user;
            let success = [];

            if (!params || !params.disputeId) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let obj = {
                mail: {
                    template: 'common',
                    subject: '',
                    message: ''
                },
                pushNotification: {
                    data: {},
                    content: ''
                },
                sms: { content: '' },
                action: sails.config.SETTINGS.ACTIONS['SERVICE_REQUEST']
            };
            // await Promise.all(_.map(params.disputeIds, async (disputeId) => {
            // find record
            let dispute = await RideComplaintDispute.findOne({ id: params.disputeId });

            // Add conversation
            dispute.conversationTrack.push({
                dateTime: moment().toISOString(),
                userId: loginUser && loginUser.id ? loginUser.id : null,
                remark: params.remark ? params.remark : null
            });
            // Add activity log
            dispute.activityTrack.push({
                dateTime: moment().toISOString(),
                userId: loginUser && loginUser.id ? loginUser.id : null,
                keyName: 'New conversation',
                oldValues: null,
                newValues: params.remark ? params.remark : null
            });
            let update = {
                conversationTrack: dispute.conversationTrack,
                activityTrack: dispute.activityTrack,
                updatedBy: loginUser.id
            };
            params.updateFilter.id = dispute.id;
            let updatedRecords = await RideComplaintDispute.update(params.updateFilter, update).fetch();
            obj.mail.message = params.remark;
            obj.pushNotification.content = obj.mail.message;
            obj.sms.content = obj.mail.message;
            obj.users = [dispute.userId]; //Send email to user only.
            if (updatedRecords && updatedRecords.length) {
                if (loginUser && loginUser.id != dispute.userId) {
                    await common.sendMailSMSAndPushNotification(obj);
                }
                let updatedRecord = _.first(updatedRecords);
                success.push(updatedRecord.id);
            }
            // return disputeId;
            // }));
            return res.ok(success, sails.config.message.EMAIL_SEND_SUCCESS);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    }

};

