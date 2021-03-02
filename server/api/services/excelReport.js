const moment = require('moment');
const moment_tz = require('moment-timezone');
const UtilService = require("./util");
const EmailService = require("./email");
const ObjectId = require('mongodb').ObjectID;

module.exports = {

    async sendExcelReport(option, isEmailSend = false, isDailyReport = true) {
        try {

            let timezone = sails.config.DEFAULT_TIME_ZONE;
            let startTime = option.startTime;
            let endTime = option.endTime

            let filter = {
                // remove limit first
                createdAt: {
                    '>=': startTime,
                    '<=': endTime
                }
            };
            console.log('filter', filter);
            let rideFilter = JSON.parse(JSON.stringify(filter));
            rideFilter.status = { '!=': sails.config.RIDE_STATUS.UNLOCK_REQUESTED };
            let utilizationReportList = await RideBooking.find(rideFilter)
                .select(['userId', 'vehicleId', 'createdAt', 'reservedDateTime', 'startDateTime', 'endDateTime', 'rideNumber', 'totalTime', 'totalKm', 'totalFare', 'fareSummary', 'status', 'rideType', 'promoCodeAmount', 'promoCodeText', 'promoCodeId', 'isPromoCodeApplied', 'isPaid'])
                .populate('userId', { select: ['name', 'emails', 'mobiles', 'firstName', 'lastName'] })
                .populate('vehicleId', { select: ['name', 'registerId'] })
                .populate('zoneId', { select: ['name'] })
                .populate('planInvoiceId', { select: ['planName'] })
                .meta({ enableExperimentalDeepTargets: true })
                .sort('rideNumber asc')
            console.log('utilizationReportList.length :>> ', utilizationReportList.length);
            let rideIds = _.map(utilizationReportList, 'id');
            let utilizationReportData = [];
            let utilizationReportDataTotal = {
                date: 'Total',
                vehicleId: '',
                riderName: '',
                mobile: '',
                email: '',
                zoneName: '',
                rideNumber: 0,
                reservedDateTime: '',
                startTime: '',
                endTime: '',
                totalFare: 0,
                rideFare: 0,
                totalKm: 0,
                totalTime: 0,
                bookingPass: '',
                totalCost: 0,
                status: '',
                unlockFees: 0,
                pausedTime: '',
                pausedCharge: 0,
                reservedTime: '',
                reservedCharge: 0,
                cancelledCharge: 0,
                promoCode: 0,
                discount: 0,
                isPaid: ''

            };

            // let currencySymbol = sails.config.CURRENCY_SYM;
            if (utilizationReportList.length > 0) {
                for (let record of utilizationReportList) {
                    let obj = {};
                    obj.date = record.createdAt ? moment_tz(record.createdAt).tz(timezone).format(`DD/MM/YYYY`) : '-';
                    obj.vehicleId = `${record.vehicleId.name} - (${record.vehicleId.registerId})`;

                    let userId = record.userId;
                    obj.riderName = userId.name;
                    if (!obj.riderName && userId.firstName) {
                        obj.riderName = `${userId.firstName} ${userId.lastName}`;
                    }
                    if (!obj.riderName) {
                        obj.riderName = 'Guest User';
                    }

                    obj.mobile = '-';
                    obj.email = '-';
                    if (userId && userId.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(userId.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(userId.mobiles, 'countryCode');
                        obj.mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (userId && userId.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(userId.emails);
                        obj.email = primaryEmail;
                    }

                    obj.zoneName = record.zoneId ? record.zoneId.name : '';
                    obj.rideNumber = record.rideNumber;

                    obj.reservedDateTime = record.reservedDateTime ? moment_tz(record.reservedDateTime).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`) : '-';
                    obj.startTime = record.startDateTime ? moment_tz(record.startDateTime).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`) : '-';
                    obj.endTime = record.startDateTime && record.endDateTime ? moment_tz(record.endDateTime).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`) : '-';

                    // ?
                    // ?
                    obj.totalKm = record.totalKm;
                    obj.totalTime = record.totalTime ? moment.utc(record.totalTime * 1000).format('HH:mm:ss') : '-';
                    utilizationReportDataTotal.totalTime += record.totalTime;
                    obj.bookingPass = '-';
                    // console.log('record.planInvoiceId', record.planInvoiceId, record.type);
                    if (record.rideType === sails.config.RIDE_TYPE.BOOKING_PASS) {
                        obj.bookingPass = record.planInvoiceId && record.planInvoiceId.planName;
                    }
                    obj.totalCost = record.totalFare;
                    obj.status = record.status && sails.config.STATUS_OF_RIDE[record.status] ? sails.config.STATUS_OF_RIDE[record.status] : "-";
                    obj.isPaid = record.isPaid ? 'PAID' : 'UNPAID';
                    obj.discount = 0;
                    if (record.fareSummary) {
                        obj.totalFare = record.fareSummary.subTotal ? record.fareSummary.subTotal : 0; // ?
                        if (obj.totalFare) {
                            obj.rideFare = record.fareSummary.time ? record.fareSummary.time : 0;
                            obj.rideFare += record.fareSummary.distance || 0;
                            obj.unlockFees = record.fareSummary.unlockFees ? record.fareSummary.unlockFees : 0;
                            obj.pausedTime = record.fareSummary.pausedTime ? moment.utc(record.fareSummary.pausedTime * 1000).format('HH:mm:ss') : '-';
                            obj.pausedCharge = record.fareSummary.paused ? record.fareSummary.paused : 0;
                            obj.reservedTime = record.fareSummary.reservedTime ? moment.utc(record.fareSummary.reservedTime * 1000).format('HH:mm:ss') : '-';
                            obj.reservedCharge = record.fareSummary.reserved ? record.fareSummary.reserved : 0;
                            obj.cancelledCharge = record.fareSummary.cancelled ? record.fareSummary.cancelled : 0;
                            if (record.fareSummary.rideDiscountAmount && obj.rideFare) {
                                obj.rideFare = obj.rideFare - record.fareSummary.rideDiscountAmount;
                            }
                        } else {
                            obj.totalFare = 0;
                            obj.rideFare = 0;
                            obj.unlockFees = 0;
                            obj.pausedTime = record.fareSummary.pausedTime ? moment.utc(record.fareSummary.pausedTime * 1000).format('HH:mm:ss') : '-';;
                            obj.pausedCharge = 0;
                            obj.reservedTime = record.fareSummary.reservedTime ? moment.utc(record.fareSummary.reservedTime * 1000).format('HH:mm:ss') : '-';;
                            obj.reservedCharge = 0;
                            obj.cancelledCharge = 0;
                        }
                        if (record.fareSummary.rideDiscountAmount) {
                            obj.discount += record.fareSummary.rideDiscountAmount;
                        }

                        if (record.fareSummary.unlockDiscountAmount) {
                            obj.discount += record.fareSummary.unlockDiscountAmount;
                        }
                    } else {
                        obj.totalFare = 0;
                        obj.rideFare = 0;
                        obj.unlockFees = 0;
                        obj.pausedTime = '-';
                        obj.pausedCharge = 0;
                        obj.reservedTime = '-';
                        obj.reservedCharge = 0;
                        obj.cancelledCharge = 0;
                    }

                    if (record.promoCodeText && record.promoCodeId && record.isPromoCodeApplied) {
                        obj.promoCode = record.promoCodeText;
                        obj.discount += record.promoCodeAmount;
                        utilizationReportDataTotal.promoCode += 1;
                        utilizationReportDataTotal.discount += obj.discount;
                    } else {
                        obj.promoCode = '-';
                    }



                    //obj.promoCode = record.promoCodeText ? record.promoCodeText : 0;

                    utilizationReportDataTotal.rideNumber += 1;
                    utilizationReportDataTotal.totalFare += obj.totalFare;
                    utilizationReportDataTotal.rideFare += obj.rideFare;
                    utilizationReportDataTotal.totalKm += obj.totalKm;
                    utilizationReportDataTotal.totalCost += obj.totalCost;
                    utilizationReportDataTotal.unlockFees += obj.unlockFees;
                    utilizationReportDataTotal.pausedCharge += obj.pausedCharge;
                    utilizationReportDataTotal.reservedCharge += obj.reservedCharge;
                    utilizationReportDataTotal.cancelledCharge += obj.cancelledCharge;
                    utilizationReportData.push(obj);
                }
            }
            utilizationReportDataTotal.totalFare = UtilService.getFloat(utilizationReportDataTotal.totalFare);
            utilizationReportDataTotal.rideFare = UtilService.getFloat(utilizationReportDataTotal.rideFare);
            utilizationReportDataTotal.totalKm = UtilService.getFloat(utilizationReportDataTotal.totalKm);
            utilizationReportDataTotal.totalCost = UtilService.getFloat(utilizationReportDataTotal.totalCost);
            utilizationReportDataTotal.unlockFees = UtilService.getFloat(utilizationReportDataTotal.unlockFees);
            utilizationReportDataTotal.pausedCharge = UtilService.getFloat(utilizationReportDataTotal.pausedCharge);
            utilizationReportDataTotal.reservedCharge = UtilService.getFloat(utilizationReportDataTotal.reservedCharge);
            utilizationReportDataTotal.cancelledCharge = UtilService.getFloat(utilizationReportDataTotal.cancelledCharge);

            // console.log('utilizationReportDataTotal.totalTime', utilizationReportDataTotal.totalTime);
            // console.log('typeof utilizationReportDataTotal.totalTime', typeof utilizationReportDataTotal.totalTime);
            // console.log('moment.utc ', moment.utc(utilizationReportDataTotal.totalTime * 1000).format('HH:mm:ss'));

            utilizationReportDataTotal.totalTime = utilizationReportDataTotal.totalTime ? moment.utc(utilizationReportDataTotal.totalTime * 1000).format('HH:mm:ss') : '-';
            utilizationReportData.push(utilizationReportDataTotal);

            let walletActivityFilter = {
                or: [
                    {
                        createdAt: {
                            '>=': startTime,
                            '<=': endTime
                        },
                        rideId: null
                    },
                    {
                        rideId: rideIds
                    }
                ]
            }

            let walletActivityList = await TransactionLog.find(walletActivityFilter)
                .select(['remark', 'amount', 'status', 'chargeType', 'createdAt', 'noqoodyReferenceId', 'rideId', 'transactionBy', 'type', 'planInvoiceId'])
                .populate('transactionBy', { select: ['name', 'emails', 'mobiles', 'walletAmount', 'firstName', 'lastName'] })
                .populate('rideId', { select: ['rideNumber', 'fareSummary', 'totalFare'] })
                .meta({ enableExperimentalDeepTargets: true })
            console.log('walletActivityList.length :>> ', walletActivityList.length);
            let walletActivityData = [];
            let walletActivityDataTotal = {
                date: 'Total',
                topUpAmount: 0,
                bookingPassPurchase: 0,
                bonusTopUp: 0,
                discount: 0,
                rideFare: 0,
                expiredAmt: 0,
                reservedCharge: 0,
                tax: 0,
                unlockFees: 0,
                pausedCharge: 0,
                cancelledCharge: 0
            }

            let walletCumulativeDataTotal = {
                date: 'Total',
                topUpAmount: 0,
                bookingPassPurchase: 0,
                noOfBookingPass: 0,
                bonusTopUp: 0,
                discount: 0,
                rideFare: 0,
                expiredAmt: 0,
                reservedCharge: 0,
                tax: 0,
                unlockFees: 0,
                pausedCharge: 0,
                cancelledCharge: 0
            }
            let walletCumulativeData = [];
            if (walletActivityList.length > 0) {
                let userBalances = {};
                for (let record of walletActivityList) {
                    let tmpUserId = record.transactionBy && record.transactionBy.id;
                    if (!tmpUserId) {
                        continue;
                    }

                    if (!userBalances[tmpUserId]) {
                        userBalances[tmpUserId] = {
                            opBalance: 0,
                            clBalance: 0
                        };
                    }

                    if (record.status !== sails.config.STRIPE.STATUS.succeeded) {
                        continue;
                    }

                    if (!isDailyReport) {
                        if(!userBalances[tmpUserId].opBalance){
                            userBalances[tmpUserId].opBalance = await this.calculateOpeningClosingBalance(tmpUserId, startTime);
                        }
                        
                        if(!userBalances[tmpUserId].clBalance){
                            userBalances[tmpUserId].clBalance = await this.calculateOpeningClosingBalance(tmpUserId, endTime);
                        }
                       
                    } else {
                        if (!userBalances[tmpUserId].opBalance) {
                            userBalances[tmpUserId].opBalance = record.transactionBy.walletAmount;
                        }
                        if (!userBalances[tmpUserId].clBalance) {
                            userBalances[tmpUserId].clBalance = record.transactionBy.walletAmount;
                        }

                        if (record.type === sails.config.STRIPE.TRANSACTION_TYPE.DEBIT) {
                            userBalances[tmpUserId].opBalance += record.amount;
                        } else if (record.type === sails.config.STRIPE.TRANSACTION_TYPE.CREDIT) {
                            userBalances[tmpUserId].opBalance -= record.amount;
                        }
                    }
                }
                for (let record of walletActivityList) {
                    if (!record.transactionBy || !record.transactionBy.id) {
                        continue;
                    }
                    let obj = {};
                    obj.tmpUserId = _.clone(record.transactionBy.id);
                    obj.date = record.createdAt ? moment_tz(record.createdAt).tz(timezone).format(`DD/MM/YYYY`) : '-';

                    let transactionBy = record.transactionBy;
                    obj.riderName = transactionBy.name;
                    if (!obj.riderName && transactionBy.firstName) {
                        obj.riderName = `${transactionBy.firstName} ${transactionBy.lastName}`;
                    }
                    if (!obj.riderName) {
                        obj.riderName = 'Guest User';
                    }

                    obj.mobile = '-';
                    obj.email = '-';
                    if (transactionBy && transactionBy.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(transactionBy.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(transactionBy.mobiles, 'countryCode');
                        obj.mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (transactionBy && transactionBy.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(transactionBy.emails);
                        obj.email = primaryEmail;
                    }
                    /////
                    obj.walletOpBalance = Number(parseFloat(userBalances[record.transactionBy.id].opBalance).toFixed(2)); //e divas start thayo tyare balance su hatu
                    obj.topUpAmount = 0; //ketla nu recharge karavyu
                    obj.bookingPassPurchase = 0; // purchase pass amount
                    obj.noOfBookingPass = 0; // number of pass purchase
                    obj.bonusTopUp = 0;     //system e ketla credit aapya
                    obj.discount = 0; //discount koi aapelo money add karti vakhte
                    obj.expiredAmt = 0;     //puchi ne kau
                    obj.walletClBalance = Number(parseFloat(userBalances[record.transactionBy.id].clBalance).toFixed(2));    //e divas na end par wallet ma balance su hatu
                    obj.rideFare = 0;
                    obj.rideNumber = '-';
                    obj.reservedCharge = 0;
                    obj.tax = 0;
                    obj.unlockFees = 0;
                    obj.pausedCharge = 0;
                    obj.cancelledCharge = 0;
                    let rideId = record.rideId;
                    let planInvoiceId = record.planInvoiceId;
                    if (rideId) {
                        obj.rideNumber = rideId.rideNumber;
                        obj.rideFare = rideId.totalFare;
                        if (rideId.fareSummary && obj.rideFare) {
                            obj.reservedCharge = rideId.fareSummary.reserved ? rideId.fareSummary.reserved : 0;
                            obj.tax = rideId.fareSummary.tax ? rideId.fareSummary.tax : 0;
                            obj.unlockFees = rideId.fareSummary.unlockFees ? rideId.fareSummary.unlockFees : 0;
                            obj.pausedCharge = rideId.fareSummary.paused ? rideId.fareSummary.paused : 0;
                            obj.cancelledCharge = rideId.fareSummary.cancelled ? rideId.fareSummary.cancelled : 0;
                        }
                    } else {
                        if (planInvoiceId) {
                            obj.bookingPassPurchase = record.amount || 0;
                        } else if(record.noqoodyReferenceId && record.status === sails.config.STRIPE.STATUS.succeeded){
                            obj.topUpAmount = record.amount;
                        }

                        obj.bonusTopUp = record.bonusAmount || 0;
                    }

                    obj.description = record.remark;
                    obj.referenceId = record.noqoodyReferenceId || '-';
                    obj.chargeType = sails.config.TRANSACTION_STATUS[record.chargeType] ? sails.config.TRANSACTION_STATUS[record.chargeType] : '-';
                    obj.status = sails.config.STRIPE.STRIPE_STATUS[record.status] ? sails.config.STRIPE.STRIPE_STATUS[record.status] : '-';

                    walletActivityData.push(obj);
                    if (Number(obj.topUpAmount)) {
                        walletActivityDataTotal.topUpAmount += Number(obj.topUpAmount);
                    }
                    if (Number(obj.bookingPassPurchase)) {
                        walletActivityDataTotal.bookingPassPurchase += Number(obj.bookingPassPurchase);
                    }
                    if (Number(obj.bonusTopUp)) {
                        walletActivityDataTotal.bonusTopUp += Number(obj.bonusTopUp);
                    }
                    if (Number(obj.discount)) {
                        walletActivityDataTotal.discount += Number(obj.discount);
                    }
                    if (Number(obj.rideFare)) {
                        walletActivityDataTotal.rideFare += Number(obj.rideFare);
                    }
                    if (Number(obj.expiredAmt)) {
                        walletActivityDataTotal.expiredAmt += Number(obj.expiredAmt);
                    }
                    if (Number(obj.reservedCharge)) {
                        walletActivityDataTotal.reservedCharge += Number(obj.reservedCharge);
                    }
                    if (Number(obj.tax)) {
                        walletActivityDataTotal.tax += Number(obj.tax);
                    }
                    if (Number(obj.unlockFees)) {
                        walletActivityDataTotal.unlockFees += Number(obj.unlockFees);
                    }
                    if (Number(obj.pausedCharge)) {
                        walletActivityDataTotal.pausedCharge += Number(obj.pausedCharge);
                    }
                    if (Number(obj.cancelledCharge)) {
                        walletActivityDataTotal.cancelledCharge += Number(obj.cancelledCharge);
                    }
                    // manage cumulative data
                    if (obj.status === 'Succeeded') {
                        let existIndex = _.findIndex(walletCumulativeData, { tmpUserId: record.transactionBy.id });
                        if (existIndex >= 0) {
                            let data = _.clone(walletCumulativeData[existIndex]);
                            if (obj.topUpAmount) {
                                data.topUpAmount += Number(obj.topUpAmount);
                            }

                            if (!record.rideId && Number(obj.bookingPassPurchase)) {
                                data.bookingPassPurchase += Number(obj.bookingPassPurchase);
                            }

                            if (!record.rideId && record.planInvoiceId) {
                                data.noOfBookingPass += 1;
                            }

                            if (Number(obj.bonusTopUp)) {
                                data.bonusTopUp += Number(obj.bonusTopUp);
                            }

                            if (Number(obj.discount)) {
                                data.discount += Number(obj.discount);
                            }

                            if (Number(obj.rideFare)) {
                                data.rideFare += Number(obj.rideFare);
                            }

                            if (Number(obj.expiredAmt)) {
                                data.expiredAmt += Number(obj.expiredAmt);
                            }

                            if (Number(obj.reservedCharge)) {
                                data.reservedCharge += Number(obj.reservedCharge);
                            }

                            if (Number(obj.tax)) {
                                data.tax += Number(obj.tax);
                            }

                            if (Number(obj.unlockFees)) {
                                data.unlockFees += Number(obj.unlockFees);
                            }

                            if (Number(obj.pausedCharge)) {
                                data.pausedCharge += Number(obj.pausedCharge);
                            }

                            if (Number(obj.cancelledCharge)) {
                                data.cancelledCharge += Number(obj.cancelledCharge);
                            }

                            walletCumulativeData[existIndex] = data;
                        } else {
                            walletCumulativeData.push(obj);
                        }
                    }
                }
            }
            walletActivityDataTotal.topUpAmount = UtilService.getFloat(walletActivityDataTotal.topUpAmount);
            walletActivityDataTotal.bookingPassPurchase = UtilService.getFloat(walletActivityDataTotal.bookingPassPurchase);
            walletActivityDataTotal.bonusTopUp = UtilService.getFloat(walletActivityDataTotal.bonusTopUp);
            walletActivityDataTotal.discount = UtilService.getFloat(walletActivityDataTotal.discount);
            walletActivityDataTotal.rideFare = UtilService.getFloat(walletActivityDataTotal.rideFare);
            walletActivityDataTotal.expiredAmt = UtilService.getFloat(walletActivityDataTotal.expiredAmt);
            walletActivityDataTotal.reservedCharge = UtilService.getFloat(walletActivityDataTotal.reservedCharge);
            walletActivityDataTotal.tax = UtilService.getFloat(walletActivityDataTotal.tax);
            walletActivityDataTotal.unlockFees = UtilService.getFloat(walletActivityDataTotal.unlockFees);
            walletActivityDataTotal.pausedCharge = UtilService.getFloat(walletActivityDataTotal.pausedCharge);
            walletActivityDataTotal.cancelledCharge = UtilService.getFloat(walletActivityDataTotal.cancelledCharge);


            walletActivityData.push(walletActivityDataTotal);

            if (walletCumulativeData && walletCumulativeData.length > 0) {
                _.each(walletCumulativeData, function (obj) {
                    if (Number(obj.topUpAmount)) {
                        walletCumulativeDataTotal.topUpAmount += Number(obj.topUpAmount);
                    }
                    if (Number(obj.bookingPassPurchase)) {
                        walletCumulativeDataTotal.bookingPassPurchase += Number(obj.bookingPassPurchase);
                    }
                    if (Number(obj.noOfBookingPass)) {
                        walletCumulativeDataTotal.noOfBookingPass += Number(obj.noOfBookingPass);
                    }
                    if (Number(obj.bonusTopUp)) {
                        walletCumulativeDataTotal.bonusTopUp += Number(obj.bonusTopUp);
                    }
                    if (Number(obj.discount)) {
                        walletCumulativeDataTotal.discount += Number(obj.discount);
                    }
                    if (Number(obj.rideFare)) {
                        walletCumulativeDataTotal.rideFare += Number(obj.rideFare);
                    }
                    if (Number(obj.expiredAmt)) {
                        walletCumulativeDataTotal.expiredAmt += Number(obj.expiredAmt);
                    }
                    if (Number(obj.reservedCharge)) {
                        walletCumulativeDataTotal.reservedCharge += Number(obj.reservedCharge);
                    }
                    if (Number(obj.tax)) {
                        walletCumulativeDataTotal.tax += Number(obj.tax);
                    }
                    if (Number(obj.unlockFees)) {
                        walletCumulativeDataTotal.unlockFees += Number(obj.unlockFees);
                    }
                    if (Number(obj.pausedCharge)) {
                        walletCumulativeDataTotal.pausedCharge += Number(obj.pausedCharge);
                    }
                    if (Number(obj.cancelledCharge)) {
                        walletCumulativeDataTotal.cancelledCharge += Number(obj.cancelledCharge);
                    }
                });
            }

            walletCumulativeDataTotal.topUpAmount = UtilService.getFloat(walletCumulativeDataTotal.topUpAmount);
            walletCumulativeDataTotal.bookingPassPurchase = UtilService.getFloat(walletCumulativeDataTotal.bookingPassPurchase);
            walletCumulativeDataTotal.noOfBookingPass = UtilService.getFloat(walletCumulativeDataTotal.noOfBookingPass);
            walletCumulativeDataTotal.bonusTopUp = UtilService.getFloat(walletActivityDataTotal.bonusTopUp);
            walletCumulativeDataTotal.discount = UtilService.getFloat(walletCumulativeDataTotal.discount);
            walletCumulativeDataTotal.rideFare = UtilService.getFloat(walletCumulativeDataTotal.rideFare);
            walletCumulativeDataTotal.expiredAmt = UtilService.getFloat(walletCumulativeDataTotal.expiredAmt);
            walletCumulativeDataTotal.reservedCharge = UtilService.getFloat(walletCumulativeDataTotal.reservedCharge);
            walletCumulativeDataTotal.tax = UtilService.getFloat(walletCumulativeDataTotal.tax);
            walletCumulativeDataTotal.unlockFees = UtilService.getFloat(walletCumulativeDataTotal.unlockFees);
            walletCumulativeDataTotal.pausedCharge = UtilService.getFloat(walletCumulativeDataTotal.pausedCharge);
            walletCumulativeDataTotal.cancelledCharge = UtilService.getFloat(walletCumulativeDataTotal.cancelledCharge);
            walletCumulativeData.push(walletCumulativeDataTotal);
            let topUpFilter = JSON.parse(JSON.stringify(filter));
            topUpFilter.type = sails.config.STRIPE.TRANSACTION_TYPE.CREDIT;
            topUpFilter.status = sails.config.STRIPE.STATUS.succeeded;
            topUpFilter.noqoodyReferenceId = { '!=': '' };

            let walletTopUpList = await TransactionLog.find(topUpFilter)
                .select(['remark', 'amount', 'status', 'chargeType', 'createdAt', 'noqoodyReferenceId', 'rideId', 'transactionBy'])
                .populate('transactionBy', { select: ['name', 'emails', 'mobiles', 'walletAmount', 'firstName', 'lastName'] })
                .meta({ enableExperimentalDeepTargets: true })
            console.log('walletTopUpList.length :>> ', walletTopUpList.length);
            let walletTopUpData = [];
            let walletTopUpListTotal = {
                riderName: 'Total',
                topUpAmount: 0
            };
            if (walletTopUpList.length > 0) {
                for (let record of walletTopUpList) {
                    if (!record.transactionBy || !record.transactionBy.id) {
                        continue;
                    }
                    let obj = {};
                    let transactionBy = record.transactionBy;
                    obj.riderName = transactionBy.name;
                    if (!obj.riderName && transactionBy.firstName) {
                        obj.riderName = `${transactionBy.firstName} ${transactionBy.lastName}`;
                    }
                    if (!obj.riderName) {
                        obj.riderName = 'Guest User';
                    }

                    obj.mobile = '-';
                    obj.email = '-';
                    if (transactionBy && transactionBy.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(transactionBy.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(transactionBy.mobiles, 'countryCode');
                        obj.mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (transactionBy && transactionBy.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(transactionBy.emails);
                        obj.email = primaryEmail;
                    }
                    obj.date = record.createdAt ? moment_tz(record.createdAt).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`) : '-';
                    /////
                    obj.topUpAmount = record.amount; //ketla nu recharge karavyu
                    // obj.bonusTopUp = '-';     //system e ketla credit aapya

                    obj.referenceId = record.noqoodyReferenceId || '-';
                    obj.receiptNo = record.paymentTransactionId;
                    obj.paymentMethod = 'NOQOODY';
                    obj.chargeType = sails.config.TRANSACTION_STATUS[record.chargeType] ? sails.config.TRANSACTION_STATUS[record.chargeType] : '-';
                    obj.status = sails.config.STRIPE.STRIPE_STATUS[record.status] ? sails.config.STRIPE.STRIPE_STATUS[record.status] : '-';

                    walletTopUpData.push(obj);
                    if (Number(obj.topUpAmount)) {
                        walletTopUpListTotal.topUpAmount += Number(obj.topUpAmount);
                    }
                }
            }
            walletTopUpListTotal.topUpAmount = UtilService.getFloat(walletTopUpListTotal.topUpAmount);
            walletTopUpData.push(walletTopUpListTotal);

            let riderFilter = {
                type: sails.config.USER.TYPE.CUSTOMER,
                // isGuestUser: false
            };

            let query = [
                { $sort: { transactionBy: 1, createdAt: 1 } },
                {
                    $group:
                    {
                        _id: "$transactionBy",
                        date: { $last: "$createdAt" }
                    }
                }
            ];

            let lastActivityData = await common.runAggregateQuery(query, 'transactionlog');
            let lastActivityDataObj = {};
            for (let lastActivity of lastActivityData) {
                lastActivityDataObj[lastActivity._id.toString()] = moment_tz(lastActivity.date).tz(timezone).format(`DD/MM/YYYY HH:mm:ss`);
            }

            let ridersList = await User.find(riderFilter)
                .select(['name', 'emails', 'mobiles', 'walletAmount', 'createdAt', 'firstName', 'lastName'])
                .meta({ enableExperimentalDeepTargets: true })
            console.log('walletActivityList.length :>> ', walletActivityList.length);
            let ridersData = [];
            let ridersDataTotal = {
                riderName: 'Total',
                walletAmount: 0
            };

            if (ridersList.length > 0) {
                for (let record of ridersList) {
                    let obj = {};

                    obj.riderName = record.name;
                    if (!obj.riderName && record.firstName) {
                        obj.riderName = `${record.firstName} ${record.lastName}`;
                    }
                    if (!obj.riderName) {
                        obj.riderName = 'Guest User';
                    }

                    obj.mobile = '-';
                    obj.email = '-';
                    if (record && record.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(record.mobiles, 'mobile');
                        let countryCode = UtilService.getPrimaryValue(record.mobiles, 'countryCode');
                        obj.mobile = countryCode + ' ' + primaryMobile;
                    }
                    if (record && record.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(record.emails);
                        obj.email = primaryEmail;
                    }
                    obj.walletAmount = Number(parseFloat(record.walletAmount).toFixed(2));;
                    obj.date = record.createdAt ? moment_tz(record.createdAt).tz(timezone).format(`DD/MM/YYYY`) : '-';

                    /////////// find Last Transcation
                    obj.lastActivityDate = '-';
                    if (lastActivityDataObj[record.id]) {
                        obj.lastActivityDate = lastActivityDataObj[record.id];
                    }

                    ridersData.push(obj);
                    if (Number(obj.walletAmount)) {
                        ridersDataTotal.walletAmount += Number(obj.walletAmount);
                    }
                }
            }
            ridersData.push(ridersDataTotal);

            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const utilizationReportSheet = workbook.addWorksheet('Utilization Report');
            utilizationReportSheet.mergeCells('A1', 'B1');
            utilizationReportSheet.getCell('A1').value = 'Utilization Revenue Report';
            utilizationReportSheet.getCell('A3').value = 'Start Date & Time:';
            utilizationReportSheet.getCell('B3').value = moment_tz(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            utilizationReportSheet.getCell('A4').value = 'End Date & Time:';
            utilizationReportSheet.getCell('B4').value = moment_tz(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            utilizationReportSheet.getRow(6).values = ['Date', 'E-Scooter / Vehicle ID', 'Rider Name', 'Mobile', 'Email', 'Zone Name', 'Ride Number', 'Reservation Start Time', 'Trip Start Date & Time', 'Trip End Date & Time', 'Total Fare', 'Ride Fare',
                'Total KM', 'Trip Time', 'Booking Pass Type', 'Status', 'Unlock Fees', 'Paused Time', 'Paused Charge', 'Reserved Time', 'Reserved Charge', 'Cancelled Charge', 'Promo Code', 'Discount', 'Payment Status'];

            utilizationReportSheet.columns = [
                { key: 'date', width: 15 },
                { key: 'vehicleId', width: 30 },
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'zoneName', width: 20, outlineLevel: 1 },
                { key: 'rideNumber', width: 20, outlineLevel: 1 },
                { key: 'reservedDateTime', width: 20, outlineLevel: 1 },
                { key: 'startTime', width: 20, outlineLevel: 1 },
                { key: 'endTime', width: 20, outlineLevel: 1 },
                { key: 'totalFare', width: 10, outlineLevel: 1 },
                { key: 'rideFare', width: 10, outlineLevel: 1 },
                { key: 'totalKm', width: 10, outlineLevel: 1 },
                { key: 'totalTime', width: 10, outlineLevel: 1 },
                { key: 'bookingPass', width: 15, outlineLevel: 1 },
                { key: 'status', width: 15, outlineLevel: 1 },
                { key: 'unlockFees', width: 15, outlineLevel: 1 },
                { key: 'pausedTime', width: 15, outlineLevel: 1 },
                { key: 'pausedCharge', width: 15, outlineLevel: 1 },
                { key: 'reservedTime', width: 15, outlineLevel: 1 },
                { key: 'reservedCharge', width: 15, outlineLevel: 1 },
                { key: 'cancelledCharge', width: 15, outlineLevel: 1 },
                { key: 'promoCode', width: 15, outlineLevel: 1 },
                { key: 'discount', width: 15, outlineLevel: 1 },
                { key: 'isPaid', width: 15, outlineLevel: 1 },
            ];
            utilizationReportSheet.addRows(utilizationReportData);
            // utilizationReportSheet.getRow(utilizationReportSheet.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            utilizationReportSheet.getRow(utilizationReportSheet.rowCount).font = {
                bold: true
            };

            const walletActivitySheet = workbook.addWorksheet('Wallet Activity');
            walletActivitySheet.mergeCells('A1', 'B1');
            walletActivitySheet.getCell('A1').value = 'Wallet Transactions Report';
            walletActivitySheet.getCell('A3').value = 'Start Date & Time:';
            walletActivitySheet.getCell('B3').value = moment_tz(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            walletActivitySheet.getCell('A4').value = 'End Date & Time:';
            walletActivitySheet.getCell('B4').value = moment_tz(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            walletActivitySheet.getRow(6).values = ['Date', 'Rider Name', 'Mobile', 'Email', 'Wallet Op.Balance',
                'Top-Up Amount', 'Booking Pass Purchase', 'Bonus Top-Up', 'Discount', 'Total Fare', 'Expired Amt', 'Wallet Cl.Balance', 'Ride Number', 'Description',
                'Payment gateway Ref. No.', 'ChargeType', 'Status', 'Reserved Charge', 'Tax', 'UnlockFees', 'Paused Charge', 'Cancelled Charge'];

            walletActivitySheet.columns = [
                { key: 'date', width: 15 },
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'walletOpBalance', width: 20, outlineLevel: 1 },
                { key: 'topUpAmount', width: 20, outlineLevel: 1 },
                { key: 'bookingPassPurchase', width: 20, outlineLevel: 1 },
                { key: 'bonusTopUp', width: 20, outlineLevel: 1 },
                { key: 'discount', width: 20, outlineLevel: 1 },
                { key: 'rideFare', width: 10, outlineLevel: 1 },
                { key: 'expiredAmt', width: 10, outlineLevel: 1 },
                { key: 'walletClBalance', width: 10, outlineLevel: 1 },
                { key: 'rideNumber', width: 15, outlineLevel: 1 },
                { key: 'description', width: 15, outlineLevel: 1 },
                { key: 'referenceId', width: 15, outlineLevel: 1 },
                { key: 'chargeType', width: 15, outlineLevel: 1 },
                { key: 'status', width: 15, outlineLevel: 1 },
                { key: 'reservedCharge', width: 15, outlineLevel: 1 },
                { key: 'tax', width: 15, outlineLevel: 1 },
                { key: 'unlockFees', width: 15, outlineLevel: 1 },
                { key: 'pausedCharge', width: 15, outlineLevel: 1 },
                { key: 'cancelledCharge', width: 15, outlineLevel: 1 },
            ];

            walletActivitySheet.addRows(walletActivityData);
            // walletActivitySheet.getRow(walletActivitySheet.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            walletActivitySheet.getRow(walletActivitySheet.rowCount).font = {
                bold: true
            };

            const walletCumulativeSheet = workbook.addWorksheet('Wallet Activity(Cumulative)');
            walletCumulativeSheet.mergeCells('A1', 'B1');
            walletCumulativeSheet.getCell('A1').value = 'Wallet Activity Cumulative Report';
            walletCumulativeSheet.getCell('A3').value = 'Start Date & Time:';
            walletCumulativeSheet.getCell('B3').value = moment_tz(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            walletCumulativeSheet.getCell('A4').value = 'End Date & Time:';
            walletCumulativeSheet.getCell('B4').value = moment_tz(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            walletCumulativeSheet.getRow(6).values = ['Rider Name', 'Mobile', 'Email', 'Wallet Op.Balance',
                'Top-Up Amount', 'Booking Pass Purchase', 'No. Of Pass Purchase', 'Bonus Top-Up', 'Discount', 'Total Fare', 'Wallet Cl.Balance',
                'Reserved Charge', 'Tax', 'UnlockFees', 'Paused Charge', 'Cancelled Charge'];

            walletCumulativeSheet.columns = [
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'walletOpBalance', width: 20, outlineLevel: 1 },
                { key: 'topUpAmount', width: 20, outlineLevel: 1 },
                { key: 'bookingPassPurchase', width: 20, outlineLevel: 1 },
                { key: 'noOfBookingPass', width: 20, outlineLevel: 1 },
                { key: 'bonusTopUp', width: 20, outlineLevel: 1 },
                { key: 'discount', width: 20, outlineLevel: 1 },
                { key: 'rideFare', width: 10, outlineLevel: 1 },
                { key: 'walletClBalance', width: 10, outlineLevel: 1 },
                { key: 'reservedCharge', width: 15, outlineLevel: 1 },
                { key: 'tax', width: 15, outlineLevel: 1 },
                { key: 'unlockFees', width: 15, outlineLevel: 1 },
                { key: 'pausedCharge', width: 15, outlineLevel: 1 },
                { key: 'cancelledCharge', width: 15, outlineLevel: 1 },
            ];

            walletCumulativeSheet.addRows(walletCumulativeData);
            // walletActivitySheet.getRow(walletActivitySheet.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            walletCumulativeSheet.getRow(walletCumulativeSheet.rowCount).font = {
                bold: true
            };

            const walletTopUp = workbook.addWorksheet('Wallet Top-up');
            walletTopUp.mergeCells('A1', 'B1');
            walletTopUp.getCell('A1').value = 'Wallet Top-Up Report';
            walletTopUp.getCell('A3').value = 'Start Date & Time:';
            walletTopUp.getCell('B3').value = moment_tz(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            walletTopUp.getCell('A4').value = 'End Date & Time:';
            walletTopUp.getCell('B4').value = moment_tz(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            walletTopUp.getRow(6).values = ['Rider Name', 'Mobile', 'Email', 'Date & Time Top Up',
                'Top-Up Amount', 'Payment gateway Ref. No.', 'Receipt No', 'Payment Method', 'ChargeType', 'Status'];

            walletTopUp.columns = [
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'date', width: 15 },
                { key: 'topUpAmount', width: 20, outlineLevel: 1 },
                { key: 'referenceId', width: 15, outlineLevel: 1 },
                { key: 'receiptNo', width: 15, outlineLevel: 1 },
                { key: 'paymentMethod', width: 15, outlineLevel: 1 },
                { key: 'chargeType', width: 15, outlineLevel: 1 },
                { key: 'status', width: 15, outlineLevel: 1 },
            ]

            walletTopUp.addRows(walletTopUpData);
            // walletTopUp.getRow(walletTopUp.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            walletTopUp.getRow(walletTopUp.rowCount).font = {
                bold: true
            };

            const ridersSheet = workbook.addWorksheet('Wallet Balance');
            ridersSheet.mergeCells('A1', 'B1');
            ridersSheet.getCell('A1').value = 'Wallet Balance Report';
            ridersSheet.getCell('A3').value = 'Start Date & Time:';
            ridersSheet.getCell('B3').value = moment_tz(startTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);
            ridersSheet.getCell('A4').value = 'End Date & Time:';
            ridersSheet.getCell('B4').value = moment_tz(endTime).tz(timezone).format(`DD-MM-YYYY HH:mm:ss`);

            ridersSheet.getRow(6).values = ['Rider Name', 'Mobile', 'Email', 'Wallet Opened Date', 'Wallet Balance Amount', 'Last Activity Date'];

            ridersSheet.columns = [
                { key: 'riderName', width: 32 },
                { key: 'mobile', width: 15, outlineLevel: 1 },
                { key: 'email', width: 25, outlineLevel: 1 },
                { key: 'date', width: 15 },
                { key: 'walletAmount', width: 30 },
                { key: 'lastActivityDate', width: 20, outlineLevel: 1 },
            ];

            ridersSheet.addRows(ridersData);
            // ridersSheet.getRow(ridersSheet.rowCount).fill = {
            //     type: 'pattern',
            //     pattern: 'solid',
            //     bgColor: { argb: '#FF0000' }
            // };
            ridersSheet.getRow(ridersSheet.rowCount).font = {
                bold: true
            };

            let currentDate = moment_tz(startTime).tz(timezone).format(`DD/MM/YY`);
            let subjectCurrentDate = moment_tz(startTime).tz(timezone).format(`MM/DD/YY`);
            let filepath = `${sails.config.appPath}/assets/excel`;
            let filename = `FalconReport-${moment_tz(startTime).tz(timezone).format(`DD-MM-YY`)}.xlsx`;

            await workbook.xlsx.writeFile(`${filepath}/${filename}`);
            let message = `Kindly find attached the Falcon scooter utilization report for ${subjectCurrentDate}.`;
            let setting = await Settings.findOne({
                type: sails.config.SETTINGS.TYPE.APP_SETTING
            });

            if (isEmailSend) {
                await EmailService.send({
                    subject: `Falcon Report ${currentDate}`,
                    to: setting.emailsForExportExcel,
                    attachments: [`excel/${filename}`],
                    template: 'dailyReport',
                    data: {
                        name: '-',
                        message: message
                    }
                });
            }


            return `/excel/${filename}`;

        } catch (error) {
            sails.log.error('Error while running cron sendExcelReport.', error);
        }
    },

    async calculateOpeningClosingBalance(userId, date) {
        try {

            let balance = 0;

            let query = [
                {
                    $match: {
                        createdAt: { $lt: date },
                        transactionBy: ObjectId(userId),
                        status: sails.config.STRIPE.STATUS.succeeded
                    }
                }
            ];

            let recordList = await common.runAggregateQuery(query, 'transactionlog');
            for (let record of recordList) {
                if (record.type === sails.config.STRIPE.TRANSACTION_TYPE.DEBIT) {
                    balance -= record.amount;
                } else if (record.type === sails.config.STRIPE.TRANSACTION_TYPE.CREDIT) {
                    balance += record.amount;
                }
            }

            //console.log('balance', balance);
            return balance;

        } catch (error) {
            sails.log.error('Error while running cron sendExcelReport.', error);
        }
    }
}