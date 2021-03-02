const RideBookingService = require(`${sails.config.appPath}/api/services/rideBooking`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const CommonService = require(`${sails.config.appPath}/api/services/common`);
const DeveloperService = require(`${sails.config.appPath}/api/services/developer`);
const ExcelReportService = require(`${sails.config.appPath}/api/services/excelReport`);
const PASSWORD = 'Coruscate@2021';
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    async updateRideTotalKM(req, res) {
        try {
            let params = req.allParams();
            if (!params || !params.password || params.password !== PASSWORD) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let rides = await RideBooking.find({
                totalKm: {
                    '>=': 10
                }
            });
            console.log('rides', rides.length);
            let data = [];
            for (let ride of rides) {
                let locationTrack = ride.locationTrack;
                let isRideTrack = true;
                let isRideTrack2 = false;
                if (!locationTrack || locationTrack.length <= 0) {
                    isRideTrack = false;
                    let locationTrackData = await RideLocationTrack.findOne({ rideId: ride.id });
                    if (!locationTrackData) {
                        locationTrack = [];
                    } else {
                        locationTrack = locationTrackData.locationTrack;
                        isRideTrack2 = true;
                    }
                }
                let totalKm = RideBookingService.calculateDistanceForRide(ride.startLocation, locationTrack);
                console.log(`ride.id = ${ride.id}, ${isRideTrack}, ${isRideTrack2}, totalKm before = ${ride.totalKm}, totalKm after = ${totalKm}`);
                await RideBooking.update({ id: ride.id }, { totalKm: totalKm });
                let d = {
                    rideId: ride.id,
                    isRideWithLocationTrack: isRideTrack,
                    isRideWithLocationTrackDB: isRideTrack2,
                    kmBefore: ride.totalKm,
                    kmAfter: totalKm,
                    rideNumber: ride.rideNumber
                }
                data.push(d);
            }

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async updateRideTotalKMToVehicleAndRideSummary(req, res) {
        try {
            let params = req.allParams();
            if (!params || !params.password || params.password !== PASSWORD) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let data = [];
            let query = [
                {
                    $group: {
                        _id: '$vehicleId',
                        totalKm: { $sum: '$totalKm' }
                    }
                }
            ];
            let vehiclesData = await CommonService.runAggregateQuery(query, 'rideBooking');
            for (let vehicleData of vehiclesData) {
                let vehicleSummaryQuery = {
                    vehicleId: vehicleData._id
                }
                let vehicleSummaryDataToUpdate = {
                    '$set': {
                        'rideSummary.distance': vehicleData.totalKm
                    }
                }
                // console.log('vehicleData._id', vehicleData._id);
                let vehicleSummaryData = await CommonService.runNativeQuery(vehicleSummaryQuery, vehicleSummaryDataToUpdate, 'VehicleSummary');
                // console.log('vehicleSummaryData', vehicleSummaryData);

                data.push({
                    vehicleId: vehicleData._id,
                    totalKm: vehicleData.totalKm
                });
            }

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async deleteRidesAndUpdateUser(req, res) {
        // this will delete rides, transaction and update user wallet
        try {
            let params = req.allParams();
            let isDeleteAndUpdateData = true;
            if (!params || !params.password || params.password !== PASSWORD || !params.rideNumbers || params.rideNumbers.length <= 0) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let rides = await RideBooking.find({ rideNumber: params.rideNumbers });
            console.log('rides', rides.length);
            if (rides.length !== params.rideNumbers.length) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let data = [];
            for (let ride of rides) {
                let locationTrack = ride.locationTrack;
                let isRideTrack = true;
                let isRideTrack2 = false;
                let newWalletAmount = 0;
                if (!locationTrack || locationTrack.length <= 0) {
                    isRideTrack = false;
                    let locationTrackData = await RideLocationTrack.findOne({ rideId: ride.id });
                    if (locationTrackData) {
                        isRideTrack2 = true;
                    }
                }
                let user = await User.findOne({ id: ride.userId });
                // console.log('user', user);
                let t = await TransactionLog.findOne({ rideId: ride.id });
                newWalletAmount = UtilService.getFloat(user.walletAmount + t.amount);
                let mobile = '-';
                let email = '-';
                if (user && user.mobiles) {
                    let primaryMobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
                    let countryCode = UtilService.getPrimaryValue(user.mobiles, 'countryCode');
                    mobile = countryCode + ' ' + primaryMobile;
                }
                if (user && user.emails) {
                    let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                    email = primaryEmail;
                }
                let d = {
                    // rideId: ride.id,
                    // userId: user.id,
                    rideNumber: ride.rideNumber,
                    rideCharge: ride.totalFare,
                    name: user.name ? user.name : `${user.firstName} ${user.lastName}`,
                    email: email,
                    mobile: mobile,
                    currentWalletAmount: user.walletAmount,
                    newWalletAmount: newWalletAmount,
                    transactionAmount: t.amount,
                    paymentTransactionId: t.paymentTransactionId
                };
                // delete RideLocationTrack;
                if (isDeleteAndUpdateData) {
                    await RideLocationTrack.destroy({ rideId: ride.id });
                    await RideBooking.destroy({ id: ride.id });
                    await TransactionLog.destroy({ rideId: ride.id });
                    await User.update({ id: ride.userId }, { walletAmount: newWalletAmount });
                }
                data.push(d);
            }

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async deleteReferTransactionsAndUpdateUser(req, res) {
        // this will delete rides, transaction and update user wallet
        try {
            let params = req.allParams();
            let isDeleteAndUpdateData = true;
            if (!params || !params.password || params.password !== PASSWORD) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let transactions = await TransactionLog.find({ remark: 'Add referral bonus to wallet' });
            console.log('transactions', transactions.length);
            let userIds = _.map(transactions, 'transactionBy');
            let userData = await User.find({
                id: userIds
            });
            let users = {};
            if (!isDeleteAndUpdateData) {
                for (let user of userData) {
                    users[user.id] = user;
                }
            }

            let data = [];
            let tIds = [];
            let uIds = [];
            let newWalletAmount = 0;
            for (let transaction of transactions) {
                let user;
                if (isDeleteAndUpdateData) {
                    user = await User.findOne({ id: transaction.transactionBy });
                } else {
                    user = users[transaction.transactionBy];
                }
                newWalletAmount = UtilService.getFloat(user.walletAmount - transaction.amount);
                let mobile = '-';
                let email = '-';
                if (user && user.mobiles) {
                    let primaryMobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
                    let countryCode = UtilService.getPrimaryValue(user.mobiles, 'countryCode');
                    mobile = countryCode + ' ' + primaryMobile;
                }
                if (user && user.emails) {
                    let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                    email = primaryEmail;
                }
                let d = {
                    // rideId: ride.id,
                    // userId: user.id,
                    name: user.name ? user.name : `${user.firstName} ${user.lastName}`,
                    email: email,
                    mobile: mobile,
                    currentWalletAmount: user.walletAmount,
                    newWalletAmount: newWalletAmount,
                    transactionAmount: transaction.amount,
                    paymentTransactionId: transaction.paymentTransactionId
                };
                if (isDeleteAndUpdateData) {
                    await TransactionLog.destroy({ id: transaction.id });
                    await User.update({ id: user.id }, { walletAmount: newWalletAmount });
                    // if (!users[user.id]) {
                    //     users[user.id] = {};
                    // }
                    // users[user.id].walletAmount = newWalletAmount;
                } else {
                    users[transaction.transactionBy].walletAmount = newWalletAmount;
                }
                data.push(d);
                tIds.push(transaction.id);
                uIds.push(user.id);
            }

            let allData = {
                data: data,
                tIds: tIds,
                uIds: uIds
            };

            return res.ok(allData, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async deleteBonusTransactionsAndUpdateUser(req, res) {
        // this will delete rides, transaction and update user wallet
        try {
            let params = req.allParams();
            let isDeleteAndUpdateData = true;
            if (!params || !params.password || params.password !== PASSWORD) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let transactions = await TransactionLog.find({
                "bonusTransactionId": { '!=': null },
                status: 6
                // "bonusTransactionId": null,
                // "remark": "Bonus credited in wallet",
                // "status": 6,
            });
            console.log('transactions', transactions.length);
            let users = {};
            if (!isDeleteAndUpdateData) {
                let userIds = _.map(transactions, 'transactionBy');
                let userData = await User.find({
                    id: userIds
                });
                for (let user of userData) {
                    users[user.id] = user;
                }
            }

            let data = [];
            let tIds = [];
            let uIds = [];
            let newWalletAmount = 0;
            for (let transaction of transactions) {
                let user;
                if (isDeleteAndUpdateData) {
                    user = await User.findOne({ id: transaction.transactionBy });
                } else {
                    user = users[transaction.transactionBy];
                }
                newWalletAmount = UtilService.getFloat(user.walletAmount - transaction.amount);
                let mobile = '-';
                let email = '-';
                if (user && user.mobiles) {
                    let primaryMobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
                    let countryCode = UtilService.getPrimaryValue(user.mobiles, 'countryCode');
                    mobile = countryCode + ' ' + primaryMobile;
                }
                if (user && user.emails) {
                    let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                    email = primaryEmail;
                }
                let d = {
                    // rideId: ride.id,
                    // userId: user.id,
                    name: user.name ? user.name : `${user.firstName} ${user.lastName}`,
                    email: email,
                    mobile: mobile,
                    currentWalletAmount: user.walletAmount,
                    transactionAmount: transaction.amount,
                    newWalletAmount: newWalletAmount,
                    paymentTransactionId: transaction.paymentTransactionId,
                    promoCodeName: transaction.promoCodeData.name,
                    promoCode: transaction.promoCodeData.code
                };
                if (isDeleteAndUpdateData) {
                    await TransactionLog.destroy({ id: transaction.id });
                    await TransactionLog.update({ id: transaction.bonusTransactionId }, { bonusAmount: 0 });
                    await User.update({ id: user.id }, { walletAmount: newWalletAmount });
                } else {
                    users[transaction.transactionBy].walletAmount = newWalletAmount;
                }
                data.push(d);
                tIds.push(transaction.id);
                uIds.push(user.id);
            }

            let allData = {
                data: data,
                tIds: tIds,
                uIds: uIds
            };

            return res.ok(allData, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async deleteModelWiseData(req, res) {
        try {
            let params = req.allParams();
            let isDeleteAndUpdateData = true;
            if (!params || !params.password || params.password !== PASSWORD || !params.model || !params.filter) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            let allData = {};
            switch (params.model) {
                case "user":
                    allData = await DeveloperService.deleteUsersAllData(params.filter, isDeleteAndUpdateData, req.user.id, params.remark);
                    break;
                case "ride":
                    allData = await DeveloperService.deleteRidesAllData(params.filter, isDeleteAndUpdateData, req.user.id, params.remark);
                    break;
                case "transaction":
                    allData = await DeveloperService.deleteTransactionAllData(params.filter, isDeleteAndUpdateData, req.user.id, params.remark);
                    break;
                case "vehicle":
                    allData = await DeveloperService.deleteVehicleAllData(params.filter, isDeleteAndUpdateData, req.user.id, params.remark);
                    break;
            }

            return res.ok(allData, sails.config.message.OK);

        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async deleteExtraRideTransactionsAndUpdateUser(req, res) {
        // this will delete rides, transaction and update user wallet
        try {
            let params = req.allParams();
            let isDeleteAndUpdateData = true;
            if (!params || !params.password || params.password !== PASSWORD) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let query = [
                {
                    $match: {
                        rideId: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: {
                            rideId: '$rideId'
                        },
                        userId: { $first: '$transactionBy' },
                        sum: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        sum: {
                            $gte: 2
                        }
                    }
                },
                {
                    $project: {
                        rideId: '$_id.rideId',
                        userId: 1
                    }
                }
            ];
            // we have ride ids here
            let rides = await CommonService.runAggregateQuery(query, 'transactionlog');
            console.log('rides', rides.length);
            if (!rides.length) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let userIds = _.map(rides, 'userId');
            for (let key in userIds) {
                userIds[key] = userIds[key].toString();
            }
            let userData = await User.find({
                id: userIds
            });
            let users = {};
            if (!isDeleteAndUpdateData) {
                for (let user of userData) {
                    users[user.id] = user;
                }
            }
            let data = [];
            for (let ride of rides) {
                // console.log('user', user);
                let rideId = ride.rideId.toString();
                let transactions = await TransactionLog.find({ rideId: rideId }).sort('createdAt desc');
                let tCount = 0;
                for (let t of transactions) {
                    tCount++;
                    if (tCount === 1) {
                        continue;
                    }
                    let newWalletAmount = 0;
                    let userId = ride.userId.toString();
                    let user;
                    if (isDeleteAndUpdateData) {
                        user = await User.findOne({ id: userId })
                    } else {
                        user = users[userId];
                    }
                    newWalletAmount = UtilService.getFloat(user.walletAmount + t.amount);
                    let mobile = '-';
                    let email = '-';
                    if (user && user.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(user.mobiles, 'countryCode');
                        mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (user && user.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                        email = primaryEmail;
                    }
                    let d = {
                        rideId: rideId,
                        userId: user.id,
                        // rideNumber: ride.rideNumber,
                        // rideCharge: ride.totalFare,
                        name: user.name ? user.name : `${user.firstName} ${user.lastName}`,
                        email: email,
                        mobile: mobile,
                        currentWalletAmount: user.walletAmount,
                        newWalletAmount: newWalletAmount,
                        transactionAmount: t.amount,
                        paymentTransactionId: t.paymentTransactionId,
                        transaction: t
                    };
                    // delete RideLocationTrack;
                    if (isDeleteAndUpdateData) {
                        if (t.id) {
                            await TransactionLog.destroy({ id: t.id });
                            await User.update({ id: userId }, { walletAmount: newWalletAmount });
                        }
                    } else {
                        users[userId].walletAmount = newWalletAmount;
                    }
                    data.push(d);
                }
            }

            return res.ok(data, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async recalculateRideFare(req, res) {
        // this will delete rides, transaction and update user wallet
        try {
            let params = req.allParams();
            let isUpdateData = true;
            if (!params || !params.password || !params.startDate || !params.endDate || params.password !== PASSWORD) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let rides = await RideBooking.find({
                status: [
                    sails.config.RIDE_STATUS.COMPLETED,
                    sails.config.RIDE_STATUS.CANCELLED
                ],
                startDateTime: {
                    '>=': params.startDate,
                    '<=': params.endDate
                },
                'fareSummary.isRecalculated': {
                    '!=': true
                },
                or: [
                    {
                        'fareSummary.reserved': {
                            '>': 0
                        }
                    },
                    {
                        'fareSummary.paused': {
                            '>': 0
                        }
                    }
                ]
            }).meta({ enableExperimentalDeepTargets: true });
            console.log('rides', rides.length);
            if (!rides.length) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let data = [];
            let users = {};
            if (!isUpdateData) {
                let userIds = _.map(rides, 'userId');
                let userData = await User.find({
                    id: userIds
                });
                for (let user of userData) {
                    users[user.id] = user;
                }
            }
            let totalChargeDiff = 0;
            for (let ride of rides) {
                let user;
                let userId = ride.userId;
                if (isUpdateData) {
                    user = await User.findOne({ id: userId });
                } else {
                    user = users[userId];
                }

                let mobile = '-';
                let email = '-';
                if (user && user.mobiles) {
                    let primaryMobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
                    let countryCode = UtilService.getPrimaryValue(user.mobiles, 'countryCode');
                    mobile = countryCode + ' ' + primaryMobile;
                }
                if (user && user.emails) {
                    let primaryEmail = UtilService.getPrimaryEmail(user.emails);
                    email = primaryEmail;
                }
                let newFareSummary = await RideBookingService.recalculateFareForRide(ride, {}, false);
                let chargeDiff = newFareSummary.total - ride.totalFare;
                totalChargeDiff += chargeDiff;
                let newWalletAmount = user.walletAmount - chargeDiff;
                rideReserveTimeFreeLimit = ride.fareData.rideReserveTimeLimit * ride.fareData.rideReserveTimeFreeLimit;
                rideReserveTimeFreeLimit = UtilService.getFloat(rideReserveTimeFreeLimit / 100);
                rideReserveTimeFreeLimit = Math.round(rideReserveTimeFreeLimit);
                if (newFareSummary.total === ride.totalFare) {
                    if (isUpdateData) {
                        newFareSummary.isRecalculated = true;
                        let dataToUpdate = {
                            fareSummary: newFareSummary,
                            totalFare: newFareSummary.total
                        }

                        await RideBooking.update({ id: ride.id }, dataToUpdate);
                    }
                    continue;
                }

                let d = {
                    // fareData: ride.fareData,
                    // oldFareSummary: ride.fareSummary,
                    // newFareSummary: newFareSummary,
                    rideNumber: ride.rideNumber,
                    reserveTime: ride.fareSummary.reservedTime,
                    rideReserveTimeFreeLimit: rideReserveTimeFreeLimit,
                    previousReserveCharge: ride.fareSummary.reserved,
                    newReserveCharge: newFareSummary.reserved,
                    pauseTime: ride.fareSummary.pausedTime,
                    previousPauseCharge: ride.fareSummary.paused,
                    newPauseCharge: newFareSummary.paused,
                    previousTotal: ride.totalFare,
                    newTotal: newFareSummary.total,
                    chargeDiff: chargeDiff,
                    name: user.name ? user.name : `${user.firstName} ${user.lastName}`,
                    currentWalletAmount: user.walletAmount,
                    newWalletAmount: newWalletAmount,
                    email: email,
                    mobile: mobile,
                    userId: user.id
                }
                data.push(d);
                if (isUpdateData) {
                    newFareSummary.isRecalculated = true;
                    let dataToUpdate = {
                        fareSummary: newFareSummary,
                        totalFare: newFareSummary.total
                    }

                    await RideBooking.update({ id: ride.id }, dataToUpdate);
                    await TransactionLog.update({ rideId: ride.id }, { amount: newFareSummary.total });
                    await User.update({ id: userId }, { walletAmount: newWalletAmount });
                } else {
                    users[userId].walletAmount -= chargeDiff;
                }
            }
            let responseData = {
                data: data,
                totalChargeDiff: totalChargeDiff
            };

            return res.ok(responseData, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async generateExcelReport(req, res) {
        try {
            let params = req.allParams();
            let excelReport = await ExcelReportService.sendExcelReport(params);
            return res.ok(excelReport, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
}