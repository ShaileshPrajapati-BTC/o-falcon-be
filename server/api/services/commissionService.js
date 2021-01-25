const UtilService = require('./util');
const CommonService = require('./common');
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    async addDefaultCommission(franchiseeId, userId) {
        const commissionSetting = await Settings.findOne({ type: sails.config.SETTINGS.TYPE.COMMISSION_SETTING });
        const currentTime = await UtilService.getTimeFromNow();
        const remark = 'Default commission added.';
        const commissionObj = {
            franchiseeId: franchiseeId,
            type: commissionSetting.commissionType,
            amount: commissionSetting.commissionAmount,
            percentage: commissionSetting.commissionPercentage,
            track: [
                {
                    // data: [
                    //     {
                    //         before: commissionSetting.commissionType,
                    //         key: 'type',
                    //         remark: remark,
                    //         after: commissionSetting.commissionType
                    //     },
                    //     {
                    //         before: commissionSetting.commissionAmount,
                    //         key: 'amount',
                    //         remark: remark,
                    //         after: commissionSetting.commissionAmount
                    //     },
                    //     {
                    //         before: commissionSetting.commissionPercentage,
                    //         key: 'percentage',
                    //         remark: remark,
                    //         after: commissionSetting.commissionPercentage
                    //     }
                    // ],
                    data: [],
                    type: commissionSetting.commissionType,
                    amount: commissionSetting.commissionAmount,
                    percentage: commissionSetting.commissionPercentage,
                    dateTime: currentTime,
                    userId: userId,
                    remark: remark
                }
            ]
        };
        await Commission.create(commissionObj);
    },

    async updateCommissionInSettings(data, userId) {
        const currentTime = await UtilService.getTimeFromNow();
        const perviousSetting = await Settings.findOne({ type: sails.config.SETTINGS.TYPE.COMMISSION_SETTING });
        const criteria = { type: sails.config.SETTINGS.TYPE.COMMISSION_SETTING };
        let remark = '';
        if (data.remark) {
            remark = data.remark;
        }
        const trackObj = {
            type: data.commissionType,
            percentage: data.commissionPercentage,
            amount: data.commissionAmount,
            dateTime: currentTime,
            userId: userId,
            remark: remark
        }
        if (perviousSetting && perviousSetting.id) {
            trackObj.data = [
                {
                    before: perviousSetting.commissionType,
                    key: 'type',
                    remark: remark,
                    after: data.commissionType
                },
                {
                    before: perviousSetting.commissionAmount,
                    key: 'amount',
                    remark: remark,
                    after: data.commissionAmount
                },
                {
                    before: perviousSetting.commissionPercentage,
                    key: 'percentage',
                    remark: remark,
                    after: data.commissionPercentage
                }
            ];
        }
        const updateObj = {
            $set: {
                commissionType: data.commissionType,
                commissionAmount: data.commissionAmount,
                commissionPercentage: data.commissionPercentage
            },
            $push: {
                commissionTrack: {
                    $each: [trackObj]
                }
            }
        };

        await CommonService.runNativeQuery(criteria, updateObj, 'settings');
    },

    async updateCommissionOfAllFranchisee(data, userId) {
        const currentTime = await UtilService.getTimeFromNow();
        const allCommissions = await Commission.find({});
        let remark = '';
        if (data.remark) {
            remark = data.remark;
        }
        for (let commission of allCommissions) {
            const criteria = { _id: ObjectId(commission.id) };
            const commissionObj = {
                $set: {
                    type: data.commissionType,
                    amount: data.commissionAmount,
                    percentage: data.commissionPercentage
                },
                $push: {
                    track: {
                        $each: [
                            {
                                data: [
                                    {
                                        before: commission.type,
                                        key: 'type',
                                        remark: remark,
                                        after: data.commissionType
                                    },
                                    {
                                        before: commission.amount,
                                        key: 'amount',
                                        remark: remark,
                                        after: data.commissionAmount
                                    },
                                    {
                                        before: commission.percentage,
                                        key: 'percentage',
                                        remark: remark,
                                        after: data.commissionPercentage
                                    }
                                ],
                                type: data.commissionType,
                                amount: data.commissionAmount,
                                percentage: data.commissionPercentage,
                                dateTime: currentTime,
                                userId: ObjectId(userId),
                                remark: remark
                            }
                        ]
                    }
                }
            }
            await CommonService.runNativeQuery(criteria, commissionObj, 'commission');
        }
    },

    async updateCommissionOfFranchisee(data, userId) {
        const currentTime = await UtilService.getTimeFromNow();
        let remark = '';
        if (data.remark) {
            remark = data.remark;
        }
        const lastCommission = await Commission.findOne({ franchiseeId: data.franchiseeId });
        let trackObj = {
            type: data.type,
            amount: data.amount,
            percentage: data.percentage,
            dateTime: currentTime,
            userId: ObjectId(userId),
            remark: remark
        };
        if (lastCommission && lastCommission.id) {
            trackObj.data = [
                {
                    before: lastCommission.type,
                    key: 'type',
                    remark: remark,
                    after: data.type
                },
                {
                    before: lastCommission.amount,
                    key: 'amount',
                    remark: remark,
                    after: data.amount
                },
                {
                    before: lastCommission.percentage,
                    key: 'percentage',
                    remark: remark,
                    after: data.percentage
                }
            ];
        }
        const criteria = {
            franchiseeId: ObjectId(data.franchiseeId),
        };
        let date = await UtilService.getTimeFromNow();
        const commissionObj = {
            $set: {
                type: data.type,
                amount: data.amount,
                percentage: data.percentage,
                updatedAt: date
            },
            $push: {
                track: {
                    $each: [trackObj]
                }
            }
        }

        await CommonService.runNativeQuery(criteria, commissionObj, 'commission');
    },

    validateCommissionValues(type, amount, percentage) {
        let valueObj = {
            amount: 0.00,
            percentage: 0.00
        };
        if (type == sails.config.COMMISSION_TYPES.AMOUNT) {
            if (!amount) {
                throw sails.config.message.BAD_REQUEST;
            }
            valueObj.amount = amount;
        } else if (type == sails.config.COMMISSION_TYPES.PERCENTAGE) {
            if (!percentage) {
                throw sails.config.message.BAD_REQUEST;
            }
            if (percentage > 100) {
                throw sails.config.message.INVALID_PERCENTAGE_VALUE;
            }
            valueObj.percentage = percentage;
        }

        return valueObj;
    },

    async getUnpaidCommission(franchiseeId) {
        let remainToPayAmount = await this.getUnpaidCommissionFromNativeQuery(franchiseeId, sails.config.COMMISSION_PAYMENT_STATUS.UNPAID, '$franchiseeCommission');
        let partialUnpaidAmount = await this.getUnpaidCommissionFromNativeQuery(franchiseeId, sails.config.COMMISSION_PAYMENT_STATUS.PARTIAL_PAID, '$commissionRemainedToPay');
        if (remainToPayAmount && remainToPayAmount.length > 0) {
            remainToPayAmount = remainToPayAmount[0].sum;
        } else {
            remainToPayAmount = 0;
        }
        if (partialUnpaidAmount && partialUnpaidAmount.length > 0) {
            partialUnpaidAmount = partialUnpaidAmount[0].sum;
        } else {
            partialUnpaidAmount = 0;
        }
        let unpaidCommission = {
            amount: remainToPayAmount + partialUnpaidAmount
        };

        return unpaidCommission;
    },

    async getUnpaidCommissionFromNativeQuery(franchiseeId, status, field) {
        let query = [
            {
                $match: {
                    franchiseeId: ObjectId(franchiseeId),
                    commissionPaymentStatus: status
                }
            },
            {
                $group: {
                    _id: null,
                    sum: {
                        $sum: field
                    }
                }
            },
            { $project: { _id: 0, sum: 1 } }
        ];
        let remainToPayAmount = await CommonService.runAggregateQuery(query, 'rideBooking');

        return remainToPayAmount;
    },

    async getTotalCommissionList(page, limit, sort, keyword) {
        page = parseInt(page);
        limit = parseInt(limit);
        page--;
        let query = [
            {
                $match: {
                    franchiseeId: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'franchiseeId',
                    foreignField: '_id',
                    as: 'franchiseeId'
                }
            },
            {
                $unwind: "$franchiseeId"
            }
        ];

        if (keyword) {
            // keyword = keyword.split('').join('%'); // for advance search
            query.push({
                $match: {
                    "franchiseeId.name": {
                        $regex: new RegExp("^" + _.escapeRegExp(`%${keyword}%`).replace(/^%/, ".*").replace(/([^\\])%/g, "$1.*").replace(/\\%/g, "%") + "$"),
                        $options: "i"
                    }
                }
            });
        }

        query.push(
            {
                $group: {
                    _id: { franchiseeId: "$franchiseeId" },
                    unpaidCommission: {
                        $sum: {
                            $cond: [
                                { $eq: ["$commissionPaymentStatus", sails.config.COMMISSION_PAYMENT_STATUS.UNPAID] }, "$franchiseeCommission", 0
                            ]
                        }
                    },
                    paidCommission: {
                        $sum: {
                            $cond: [
                                { $eq: ["$commissionPaymentStatus", sails.config.COMMISSION_PAYMENT_STATUS.COMPLETED] }, "$franchiseeCommission", 0
                            ]
                        }
                    },
                    partialCommission: {
                        $sum: {
                            $cond: [
                                { $eq: ["$commissionPaymentStatus", sails.config.COMMISSION_PAYMENT_STATUS.PARTIAL_PAID] }, "$commissionRemainedToPay", 0
                            ]
                        }
                    },
                    totalCommission: {
                        $sum: "$franchiseeCommission"
                    }
                }
            },
            {
                $lookup: {
                    from: 'CommissionPayout',
                    "let": { "fId": "$_id.franchiseeId._id" },
                    pipeline: [
                        {
                            $match: {
                                "$expr": { "$eq": ["$franchiseeId", "$$fId"] },
                                status: sails.config.COMMISSION_PAYOUT_TYPE.TRANSFERRED
                            }
                        },
                        { "$sort": { "_id": -1 } },
                        { "$limit": 1 }
                    ],
                    as: 'lastPayment'
                }
            },
            {
                $unwind: {
                    "path": "$lastPayment",
                    "preserveNullAndEmptyArrays": true,
                }
            },
            {
                $project: {
                    "lastPayment": { $ifNull: ["$lastPayment", {}] },
                    paidCommission: 1,
                    partialCommission: 1,
                    totalCommission: 1,
                    unpaidCommission: 1,
                    franchiseeId: "$_id.franchiseeId",
                    "_id.franchiseeId": "$_id.franchiseeId._id"
                }
            },
            { $limit: limit },
            { $skip: (page * limit) }
        );

        if (sort) {
            let sortObj = { $sort: {} };
            sortObj.$sort[sort.field] = sort.sortingType;
            query.push(sortObj);
        }
        let data = await CommonService.runAggregateQuery(query, 'rideBooking');

        return data;
    }

}