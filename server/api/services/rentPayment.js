const CommonService = require("./common");
const ObjectId = require("mongodb").ObjectID;
const EmailService = require("./email");
const UtilService = require("./util");
const WalletService = require("./wallet");

module.exports = {
    async addPayoutRequest(payoutObj) {
        let commissionPayout = await CommissionPayout.create(payoutObj).fetch();

        return commissionPayout;
    },

    async getTotalRequestedCommission(referenceId) {
        let query = [
            {
                $match: {
                    referenceId: ObjectId(referenceId),
                    status: sails.config.COMMISSION_PAYOUT_TYPE.REQUESTED,
                },
            },
            {
                $group: {
                    _id: null,
                    sum: {
                        $sum: "$amount",
                    },
                },
            },
            { $project: { _id: 0, sum: 1 } },
        ];
        let data = await CommonService.runAggregateQuery(query, "rentpayment");

        return data;
    },

    async sendStatusChangeMail(data, user) {
        let primaryEmail = UtilService.getPrimaryEmail(user.emails);

        let mail_obj = {
            subject: "Rent Payment Request",
            to: primaryEmail,
            template: "commissionRequestStatusChangeEmail",
            data: data,
            language: user.preferredLang,
        };
        EmailService.send(mail_obj);
    },

    async rentPaymentSummary(filter, loggedInUser) {
        const payableType = sails.config.RENT_PAYMENT_TYPE.ACCOUNT_PAYABLE;
        let rentPayments = await RentPayment.find(filter).select([
            "amount",
            "type",
            "referenceId",
        ]);

        let accountReceivable = 0;
        let accountPayable = 0;
        for (let rentPayment of rentPayments) {
            let isPayableType = rentPayment.type === payableType;
            if (rentPayment.referenceId === loggedInUser.id) {
                // reverse type of record
                isPayableType = !isPayableType;
            }
            if (isPayableType) {
                accountPayable += rentPayment.amount;
            } else {
                accountReceivable += rentPayment.amount;
            }
        }

        return { accountReceivable, accountPayable };
    },

    getUpdatedParamsForRentPayment(params, user, summaryById = false) {
        const {
            dealerType,
            franchiseeType,
            superAdminType,
        } = this.getUserTypes();
        let storedParentId = summaryById ? user.id : params.filter.parentId;
        let storedReferenceId = summaryById
            ? user.id
            : params.filter.referenceId;
        const isDealer = user.type === dealerType;
        const isFranchisee = user.type === franchiseeType;
        const isSuperAdmin = sails.config.USER.ADMIN_USERS.includes(user.type);
        if (isSuperAdmin) {
            params.filter.parentId = null;
        } else if (isFranchisee) {
            if (!("referenceId" in params.filter) && !summaryById) {
                // DO NOTHING CAUSE OF NR
                // console.log('\n 93 ------------- ')
                // delete params.filter.parentId;
                // params.filter.or = [
                //     { parentId: storedParentId },
                //     { referenceId: storedParentId },
                // ];
            } else {
                // console.log(' 100 ------------- \n')
                delete params.filter.parentId;
                params.filter.referenceId = storedReferenceId
                    ? storedReferenceId
                    : storedParentId;
            }
        } else if (isDealer) {
            params.filter.referenceId = user.id;
        }
        if (params.search && params.search.keys && params.search.keyword) {
            _.forEach(params.search.keys, (key) => {
                if (key) {
                    params.filter[key] = { contains: params.search.keyword };
                }
            });
        }

        return params;
    },

    async requestRentPaymentForDealer() {
        try {
            let dealerList = await User.find({
                type: sails.config.USER.TYPE.DEALER,
            }).select(["id", "name", "walletAmount", "franchiseeId", "type"]);
            for (let dealer of dealerList) {
                let assignedVehicles = await Vehicle.find({
                    dealerId: dealer.id,
                    dealerRentStartDate: { "!=": "" },
                }).select([
                    "dealerRentStartDate",
                    "name",
                    "dealerLastRentPaymentDate",
                    "franchiseeLastRentPaymentDate",
                ]);
                if (assignedVehicles.length === 0) {
                    // console.log(dealer.name, " - assignedVehicles EMPTY");
                    continue;
                }
                console.log(
                    dealer.id,
                    " - ",
                    dealer.name,
                    " - requestRentPayment -> assignedVehicles -> ",
                    assignedVehicles
                );
                let rent = await Rent.findOne({ referenceId: dealer.id });
                if (!rent || !rent.vehicleRentAmount) {
                    // console.log(
                    //     "!rent.vehicleRentAmount -",
                    //     dealer.id,
                    //     " - ",
                    //     dealer.name
                    // );
                    continue;
                }
                let vehicleRentForDealer = rent.vehicleRentAmount;
                let dayDiff = 0;
                let summary = [];
                let statusTrack = [];
                let rentAmount = 0;
                _.forEach(assignedVehicles, (vehicle) => {
                    if (!vehicle.dealerRentStartDate) {
                        // console.log(
                        //     "!vehicle.dealerRentStartDate -",
                        //     dealer.id,
                        //     " - ",
                        //     dealer.name,
                        //     " - vehicleName ",
                        //     vehicle.name
                        // );
                        return;
                    }
                    console.log("vehicle.name - ", vehicle.name);
                    // ****** todo: ask about how to calculate partial rent payment ******
                    summary.push({
                        vehicleId: vehicle.id,
                        rent: vehicleRentForDealer,
                    });
                    rentAmount += vehicleRentForDealer;
                });
                let finalAmount = dealer.walletAmount - rentAmount;
                let rentPaymentType =
                    finalAmount > 0
                        ? sails.config.RENT_PAYMENT_TYPE.ACCOUNT_PAYABLE
                        : sails.config.RENT_PAYMENT_TYPE.ACCOUNT_RECEIVABLE;
                if (finalAmount > 0) {
                    await WalletService.updateUserWallet(dealer.id, 0);
                    await this.creditFranchiseeWallet(
                        dealer.franchiseeId,
                        rentAmount
                    );
                    statusTrack.push({
                        data: [],
                        dateTime: UtilService.getTimeFromNow(),
                        userId: dealer.id,
                        remark: "Rent Payment requested",
                        status: sails.config.RENT_PAYMENT_STATUS.REQUESTED,
                        amount: Math.abs(finalAmount),
                    });
                    let createParams = {
                        referenceId: dealer.id,
                        amount: Math.abs(finalAmount),
                        rentAmount: rentAmount,
                        dateTime: UtilService.getTimeFromNow(),
                        fareSummary: summary,
                        type: rentPaymentType,
                        statusTrack: statusTrack,
                        parentId: dealer.franchiseeId,
                        userType: dealer.type,
                    };
                    await RentPayment.create(createParams);
                } else {
                    // if receivable from dealer then increase franchisee virtual balance
                    await this.creditFranchiseeWallet(
                        dealer.franchiseeId,
                        Math.abs(finalAmount) + dealer.walletAmount
                    );
                    await WalletService.updateUserWallet(
                        dealer.id,
                        finalAmount
                    );
                }
                await this.updateLastRentPaymentDateInVehicles(
                    assignedVehicles
                );
                console.log("END ********* ", dealer.id, dealer.name);
            }
        } catch (e) {
            console.log("request rent payment dealer - ", e);
        }
    },

    async creditFranchiseeWallet(franchiseeId, amount) {
        let finalAmount = Math.abs(amount);
        await WalletService.increaseDecreaseWallet(franchiseeId, finalAmount);
    },

    async handleWalletForRentPayment(rentPaymentObj, status) {
        if (
            (rentPaymentObj.type ===
                sails.config.RENT_PAYMENT_TYPE.ACCOUNT_RECEIVABLE &&
                status === sails.config.RENT_PAYMENT_STATUS.TRANSFERRED) ||
            (rentPaymentObj.type ===
                sails.config.RENT_PAYMENT_TYPE.ACCOUNT_PAYABLE &&
                status === sails.config.RENT_PAYMENT_STATUS.REJECTED)
        ) {
            await WalletService.increaseDecreaseWallet(
                rentPaymentObj.referenceId,
                rentPaymentObj.amount
            );
        }
    },

    async requestRentPaymentForFranchisee() {
        try {
            let franchiseeList = await User.find({
                type: sails.config.USER.TYPE.FRANCHISEE,
            }).select(["id", "name", "walletAmount", "type"]);
            for (let franchisee of franchiseeList) {
                let assignedVehicles = await Vehicle.find({
                    franchiseeId: franchisee.id,
                    franchiseeRentStartDate: { "!=": "" },
                }).select([
                    "franchiseeRentStartDate",
                    "name",
                    "franchiseeLastRentPaymentDate",
                ]);
                if (assignedVehicles.length === 0) {
                    // console.log(franchisee.name, " - assignedVehicles EMPTY");
                    continue;
                }
                console.log(
                    franchisee.id,
                    " - ",
                    franchisee.name,
                    " - requestRentPayment -> assignedVehicles -> ",
                    assignedVehicles
                );
                let rent = await Rent.findOne({ referenceId: franchisee.id });
                if (!rent || !rent.vehicleRentAmount) {
                    // console.log(
                    //     "!rent.vehicleRentAmount -",
                    //     franchisee.id,
                    //     " - ",
                    //     franchisee.name
                    // );
                    continue;
                }
                let vehicleRentForFranchisee = rent.vehicleRentAmount;
                let dayDiff = 0;
                let summary = [];
                let statusTrack = [];
                let rentAmount = 0;
                _.forEach(assignedVehicles, (vehicle) => {
                    if (!vehicle.franchiseeRentStartDate) {
                        // console.log(
                        //     "!vehicle.franchiseeRentStartDate -",
                        //     franchisee.id,
                        //     " - ",
                        //     franchisee.name,
                        //     " - vehicleName ",
                        //     vehicle.name
                        // );
                        return;
                    }
                    console.log("vehicle.name - ", vehicle.name);
                    // ****** todo: ask about how to calculate partial rent payment ******
                    summary.push({
                        vehicleId: vehicle.id,
                        rent: vehicleRentForFranchisee,
                    });
                    rentAmount += vehicleRentForFranchisee;
                });
                console.log("franchisee.walletAmount", franchisee.walletAmount);
                let finalAmount = franchisee.walletAmount - rentAmount;
                let rentPaymentType =
                    finalAmount > 0
                        ? sails.config.RENT_PAYMENT_TYPE.ACCOUNT_PAYABLE
                        : sails.config.RENT_PAYMENT_TYPE.ACCOUNT_RECEIVABLE;
                if (finalAmount > 0) {
                    await WalletService.updateUserWallet(franchisee.id, 0);
                } else {
                    await WalletService.updateUserWallet(
                        franchisee.id,
                        finalAmount
                    );
                }
                statusTrack.push({
                    data: [],
                    dateTime: UtilService.getTimeFromNow(),
                    userId: franchisee.id,
                    remark: "Rent Payment requested",
                    status: sails.config.RENT_PAYMENT_STATUS.REQUESTED,
                    amount: Math.abs(finalAmount),
                });
                let createParams = {
                    referenceId: franchisee.id,
                    amount: Math.abs(finalAmount),
                    rentAmount: rentAmount,
                    dateTime: UtilService.getTimeFromNow(),
                    fareSummary: summary,
                    type: rentPaymentType,
                    statusTrack: statusTrack,
                    parentId: null,
                    userType: franchisee.type,
                };
                await RentPayment.create(createParams);
                await this.updateLastRentPaymentDateInVehicles(
                    assignedVehicles,
                    false
                );
                console.log("END 2 ********* ", franchisee.id, franchisee.name);
            }
        } catch (e) {
            console.log("request rent payment franchisee - ", e);
        }
    },

    async updateLastRentPaymentDateInVehicles(
        assignedVehicles,
        isDealerType = true
    ) {
        let assignedVehiclesIds = _.map(assignedVehicles, (v) => v.id);
        console.log("assignedVehiclesIds", assignedVehiclesIds);
        let updateObj = {};
        let timeNow = UtilService.getTimeFromNow();
        if (isDealerType) {
            updateObj.dealerLastRentPaymentDate = timeNow;
        } else {
            updateObj.franchiseeLastRentPaymentDate = timeNow;
        }
        await Vehicle.update({ id: assignedVehiclesIds }, updateObj);
    },

    getUserTypes() {
        const dealerType = sails.config.USER.TYPE.DEALER;
        const franchiseeType = sails.config.USER.TYPE.FRANCHISEE;
        const superAdminType = sails.config.USER.TYPE.SUPER_ADMIN;
        return { dealerType, franchiseeType, superAdminType };
    },

    async getStatusWiseCount(params, user) {
        const {
            dealerType,
            franchiseeType,
            superAdminType,
        } = this.getUserTypes();
        let storedParentId = params.filter.parentId;
        let storedReferenceId = params.filter.referenceId;
        const isDealer = user.type === dealerType;
        const isFranchisee = user.type === franchiseeType;
        const isSuperAdmin = sails.config.USER.ADMIN_USERS.includes(user.type);
        let query = [];
        let matchFilter = {};
        if (isSuperAdmin) {
            matchFilter.parentId = null;
            if (storedReferenceId) {
                matchFilter.referenceId = ObjectId(storedReferenceId);
            }
        } else if (isFranchisee) {
            if (!("referenceId" in params.filter)) {
                matchFilter.parentId = ObjectId(storedParentId);
                // delete params.filter.parentId;
                // matchFilter.$or = [
                //     { parentId: ObjectId(storedParentId) },
                //     { referenceId: ObjectId(storedParentId) },
                // ];
            } else {
                delete params.filter.parentId;
                matchFilter.referenceId = storedReferenceId
                ? ObjectId(storedReferenceId)
                : ObjectId(storedParentId);
            }
        } else if (isDealer) {
            matchFilter.referenceId = ObjectId(user.id);
        }
        if (params.filter && params.filter.createdAt) {
            matchFilter.createdAt = {
                $gte: params.filter.createdAt[">="],
                $lte: params.filter.createdAt["<="],
            };
        }
        if (params.search) {
            matchFilter.requestId = {
                $regex: new RegExp(params.search.keyword, "i"),
            };
        }
        if (!_.isEmpty(matchFilter)) {
            query.push({
                $match: matchFilter,
            });
        }
        query.push({
            $group: {
                _id: "$status",
                count: {
                    $sum: 1,
                },
            },
        });
        query.push({
            $project: {
                _id: 0,
                status: "$_id",
                count: 1,
            },
        });

        let countInfo = await CommonService.runAggregateQuery(
            query,
            "rentpayment"
        );

        return countInfo;
    },

    async sendStatusChangeMail(rentPaymentObj, isTransferringStatus) {
        let data = {
            requestId: rentPaymentObj.requestId,
            amount: rentPaymentObj.amount,
        };
        if (isTransferringStatus) {
            data.status = "transferred";
        } else {
            data.status = "declined";
        }
        const user = await User.findOne({ id: rentPaymentObj.referenceId });
        let primaryEmail = UtilService.getPrimaryEmail(user.emails);

        let mail_obj = {
            subject: "Rent Payment Request",
            to: primaryEmail,
            template: "rentPaymentStatusChangeEmail",
            data: data,
            language: user.preferredLang,
        };
        EmailService.send(mail_obj);
    },

    async beforeCreate(rentPayment, cb) {
        const SeriesGeneratorService = require("./seriesGenerator");
        let seriesParams = {};
        const franchiseeType =
            sails.config.SERIES_GENERATOR.TYPE.FRANCHISEE_RENT_PAYMENT_SERIES;
        const dealerType =
            sails.config.SERIES_GENERATOR.TYPE.DEALER_RENT_PAYMENT_SERIES;
        const isFranchiseeType =
            rentPayment.userType === sails.config.USER.TYPE.FRANCHISEE;
        seriesParams = {
            type: isFranchiseeType ? franchiseeType : dealerType,
        };
        let series = await SeriesGeneratorService.nextSeriesGenerate(
            seriesParams
        );
        rentPayment.requestId = series.series;

        cb(null, rentPayment);
    },
};
