const StripeService = require(`./Payment/Stripe/payment`);
const NoqoodyService = require(`./Payment/Noqoody/payment`);

const UtilService = require(`./util`);
const CommonService = require('./common');
const WalletService = require(`./wallet`);
const DealerService = require(`./dealerService`);
const FranchiseeService = require(`./franchiseeService`);

module.exports = {
    async createCustomer(user) {
        try {
            let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
            let primaryEmail = UtilService.getPrimaryEmail(user.emails);
            let primaryMobile = UtilService.getPrimaryValue(user.mobiles, 'mobile');
            let description;
            if (user.facebookAuthId) {
                description = user.facebookAuthId;
            } else if (user.googleAuthId) {
                description = user.googleAuthId;
            }
            if (DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.STRIPE) {
                if (user.stripeCustomerId) {
                    return true;
                }
                await StripeService.createCustomer(user.id, primaryEmail, primaryMobile, description);
            }

            return true;
        } catch (e) {
            throw new Error(e);
        }
    },

    async createStripeCustomer(user) {
        try {
            let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
            let primaryEmail = UtilService.getPrimaryEmail(user.emails);
            if (DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.STRIPE && primaryEmail) {
                await StripeService.createCustomer(user.id, primaryEmail);
            }
        } catch (e) {
            throw new Error(e);
        }
    },

    async addCardToCustomer(user, params) {
        try {
            let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
            switch (DEFAULT_PAYMENT_METHOD) {
                case sails.config.PAYMENT_GATEWAYS.STRIPE:
                    let card = await StripeService.addCardToCustomer(user.stripeCustomerId, params.cardToken);

                    return card;
                    break;

                default:
                    break;
            }

            return params;
        } catch (e) {
            console.log('e------------------------------', e);
            throw new Error(e);
        }
    },

    async updateCustomerCard(user, params) {
        try {
            let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
            if (DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.STRIPE) {
                let cardId = params.cardDetails.id;
                delete params.cardDetails.id;
                let card = await StripeService.updateCustomerCard(
                    loggedInUser.stripeCustomerId,
                    cardId,
                    params.cardDetails
                );

                return card;
            }

            return true;
        } catch (e) {
            throw new Error(e);
        }
    },

    async removedCardFromCustomer(user, params) {
        try {
            let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
            if (DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.STRIPE) {
                await StripeService.removedCardFromCustomer(user.stripeCustomerId, params.cardId);
            }

            return true;
        } catch (e) {
            throw new Error(e);
        }
    },

    async setDefaultCustomerCard(user, params) {
        try {
            let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
            if (DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.STRIPE) {
                await StripeService.setDefaultCustomerCard(user.stripeCustomerId, params.cardId);
            }

            return true;
        } catch (e) {
            throw new Error(e);
        }
    },

    async addBalanceInUserWallet(userId, amount, paymentDetail = false) {
        if (!amount || !userId) {
            let response = { flag: false, data: 'Transaction failed.' };

            return response;
        }

        //Transaction detail object containing total amount, wallet type
        const transactionDetail = {
            userId: userId,
            totalFare: amount,
            walletTransactionType: sails.config.STRIPE.TRANSACTION_TYPE.CREDIT,
            isWalletTransaction: true
        };
        console.log('transactionDetail -> ', transactionDetail);

        try {
            let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
            let res = { flag: false };
            let data;

            const userWalletAmount = await WalletService.getUserWalletAmount(userId);
            // amount = parseFloat(amount.toFixed(2));
            amount = parseFloat(amount);
            console.log('credit amount', amount);
            if (amount > 0) {
                //Check payment method and proceed payment
                switch (DEFAULT_PAYMENT_METHOD) {
                    case sails.config.PAYMENT_GATEWAYS.STRIPE:
                        data = await StripeService.chargeCustomerForRide(transactionDetail);
                        break;

                    case sails.config.PAYMENT_GATEWAYS.NOQOODY:
                        data = await NoqoodyService.chargeCustomer(transactionDetail, paymentDetail);
                        break;

                    default:
                        break;
                }
                data.isWalletTransaction = true;
                res = await this.transactionLog(data, transactionDetail.walletTransactionType);
                //Get payment link
                if (DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.NOQOODY) {
                    let paymentData = await NoqoodyService.getPaymentLink(transactionDetail, paymentDetail, res.data.id);
                    if (!paymentData.paymentLink || !paymentData.noqoodyReferenceId) {
                        res = {};
                        res.flag = false;
                        res.data = paymentData;
                    } else {
                        res.data.noqoodyReferenceId = paymentData.noqoodyReferenceId;
                        res.data.paymentLink = paymentData.paymentLink;
                    }
                };
            } else {
                res.flag = true;
            }
            if (res.flag && data.chargeObj.status !== 'pending') {
                //Add amount to user wallet.
                const walletAmount = userWalletAmount + parseFloat(data.transactionAmount);
                await WalletService.updateUserWallet(userId, walletAmount);
            }

            return res;
        } catch (e) {
            throw e;
        }
    },

    async creditNewCustomerForWallet(userId, amount) {
        const userWalletAmount = await WalletService.getUserWalletAmount(userId);
        if (userWalletAmount > 0) {
            // already credited wallet
            return;
        }
        const walletCreditRawRide = {
            userId: userId,
            totalFare: amount,
            walletTransactionType: sails.config.STRIPE.TRANSACTION_TYPE.CREDIT,
            isWalletTransaction: true
        };

        try {
            let res = { flag: false };
            let data;

            amount = parseFloat(amount.toFixed(2));
            console.log('credit amount', amount);
            await User.update({ id: userId }, { walletAmount: amount });
            if (amount <= 0) {
                return;
            }
            data = {
                paymentType: 'WALLET',
                rideId: null,
                rideCost: walletCreditRawRide.totalFare,
                userId: userId,
                userCards: null,
                isWalletTransaction: true,
                transactionSuccess: true,
                transactionObj: null,
                tax: 0,
                transactionFees: { totalFee: walletCreditRawRide.totalFare },
                transactionCard: null,
                transactionAmount: walletCreditRawRide.totalFare,
                paymentTransactionId: '',
                chargeObj: { status: 'paid' },
                rideNumber: null,
                isSystemTransaction: true
            };
            res = await this.transactionLog(data, walletCreditRawRide.walletTransactionType);

            return res;
        } catch (e) {
            throw e;
        }
    },

    async walletPromoCodeTransactionLog(userId, amount, promoCode) {
        const walletCreditRawRide = {
            userId: userId,
            totalFare: amount,
            walletTransactionType: sails.config.STRIPE.TRANSACTION_TYPE.CREDIT,
            isWalletTransaction: true
        };

        try {
            let res = { flag: false };
            let data;

            amount = parseFloat(amount.toFixed(2));
            data = {
                paymentType: 'WALLET',
                rideId: null,
                rideCost: walletCreditRawRide.totalFare,
                userId: userId,
                userCards: null,
                isWalletTransaction: true,
                transactionSuccess: true,
                transactionObj: null,
                tax: 0,
                transactionFees: { totalFee: walletCreditRawRide.totalFare },
                transactionCard: null,
                transactionAmount: walletCreditRawRide.totalFare,
                paymentTransactionId: '',
                chargeObj: { status: 'paid' },
                rideNumber: null,
                isSystemTransaction: true,
                isWalletPromoCodeTransaction: true,
                promoCode: promoCode
            };
            res = await this.transactionLog(data, walletCreditRawRide.walletTransactionType);

            return res;
        } catch (e) {
            throw e;
        }
    },

    async addBonusForWalletTransaction(transactionObj) {
        let amount = transactionObj.bonusAmount || 0;
        if (!transactionObj.id || amount === 0) {
            return;
        }
        let transactionId = transactionObj.id;
        let userId = transactionObj.transactionBy;
        try {
            let res = { flag: false };
            let data;

            amount = parseFloat(amount.toFixed(2));
            console.log('credit amount', amount);
            let currentAmount = await WalletService.getUserWalletAmount(userId);
            await User.update({ id: userId }, { walletAmount: currentAmount + amount });
            data = {
                paymentType: 'WALLET',
                rideId: null,
                rideCost: 0,
                userId: userId,
                userCards: null,
                isWalletTransaction: true,
                transactionSuccess: true,
                transactionObj: null,
                tax: 0,
                transactionFees: { totalFee: 0 },
                transactionCard: null,
                transactionAmount: amount,
                paymentTransactionId: '',
                chargeObj: { status: 'paid' },
                rideNumber: null,
                isSystemTransaction: true,
                bonusTransactionId: transactionId
            };
            res = await this.transactionLog(data, sails.config.STRIPE.TRANSACTION_TYPE.CREDIT);

            return res;
        } catch (e) {
            throw e;
        }
    },

    async chargeCustomerForRideDeposit(ride, rideDeposit) {
        if (ride.isRideDepositCharged) {
            return true;
        }
        ride.totalFare = rideDeposit;
        ride.deductMinFare = true;
        try {
            const chargeObj = await this.chargeCustomerForRide(ride);
            if (chargeObj.flag) {
                await RideBooking.update({ id: ride.id }, {
                    isPaid: false,
                    isRideDepositCharged: true,
                    updatedBy: ride.userId
                });

                return chargeObj;
            }
        } catch (e) {
            console.log('min fare deduct failed', e);

            return { flag: false, data: {} };
        }

        return false;
    },

    async chargeCustomerForRide(ride) {
        console.log('****** chargeCustomerForRide Starts *******', ride.id);
        try {
            let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
            let res = { flag: false };
            let data;

            const {
                isWalletEnable,
                isWalletTransaction,
                userWalletAmount
            } = await WalletService.getWalletDataUsingRide(ride);

            const isNotDeductOnStartRide = !ride.deductMinFare && sails.config.DEDUCT_ON_START_RIDE;
            if (isNotDeductOnStartRide && !isWalletTransaction) {
                console.log('before ========================= ', ride.totalFare);
                ride.totalFare -= ride.fareData.rideDeposit;
                console.log('after ========================= ', ride.totalFare);
            }
            ride.totalFare = parseFloat(ride.totalFare.toFixed(2));
            let rideTotalFare = parseFloat(ride.totalFare.toFixed(2));
            console.log('ride.totalFare', ride.totalFare);
            if (ride.isPrivateRide) {
                ride.totalFare = 0;
                rideTotalFare = 0;
                await RideBooking.update({ id: ride.id }, { totalFare: 0 });
            }
            if (!sails.config.PAYMENT_DISABLED && ride.totalFare > 0) {
                let isAutoDeduct = sails.config.IS_AUTO_DEDUCT;
                let amountDiff = userWalletAmount - ride.totalFare;
                let paymentUsingWalletFails = false;
                let isPartialPayment = false; // amountDiff < 0 && isAutoDeduct;
                console.log('amountDiff ----- ', amountDiff);
                if ((isWalletEnable && !isPartialPayment) || (isWalletEnable && isPartialPayment && userWalletAmount >= 0)) {
                    if (isPartialPayment && userWalletAmount >= 0) {
                        ride.totalFare = userWalletAmount; // deduct whatever amount is there in wallet
                    } // else negative wallet amount directly
                    data = await WalletService.chargeCustomerForRide(ride);
                    if (sails.config.IS_FRANCHISEE_ENABLED) {
                        data.franchiseeId = ride.franchiseeId;
                        data.userType = sails.config.USER.TYPE.FRANCHISEE;
                    }
                    if (ride && ride.dealerId) {
                        data.dealerId = ride.dealerId;
                        data.userType = sails.config.USER.TYPE.DEALER;
                    }
                    const walletTransactionType = sails.config.STRIPE.TRANSACTION_TYPE.DEBIT;
                    res = await this.transactionLog(data, walletTransactionType);
                    paymentUsingWalletFails = !data.transactionSuccess;
                }

                if (isPartialPayment) {
                    paymentUsingWalletFails = true;
                    // deducting remaining amount from payment method
                    ride.totalFare = amountDiff * -1;
                }
                console.log('isPartialPayment ----- ', isPartialPayment);
                console.log('paymentUsingWalletFails ----- ', paymentUsingWalletFails);
                console.log('ride.totalFare ----- ', ride.totalFare);

                if (!isWalletEnable || paymentUsingWalletFails) {
                    switch (DEFAULT_PAYMENT_METHOD) {
                        case sails.config.PAYMENT_GATEWAYS.STRIPE:
                            data = await StripeService.chargeCustomerForRide(ride);
                            break;

                        default:
                            break;
                    }
                    if (sails.config.IS_FRANCHISEE_ENABLED) {
                        data.franchiseeId = ride.franchiseeId;
                        data.userType = sails.config.USER.TYPE.FRANCHISEE;
                    }
                    if (ride && ride.dealerId) {
                        data.dealerId = ride.dealerId;
                        data.userType = sails.config.USER.TYPE.DEALER;
                    }
                    res = await this.transactionLog(data, ride.walletTransactionType);

                    console.log('before retrying payment using wallet --> isPartialPayment ', isPartialPayment);
                    console.log('data.transactionSuccess ', data.transactionSuccess);
                    if (isWalletEnable && isPartialPayment && !data.transactionSuccess) {
                        data = await WalletService.chargeCustomerForRide(ride); // here goes wallet in minus
                        const walletTransactionType = sails.config.STRIPE.TRANSACTION_TYPE.DEBIT;
                        res = await this.transactionLog(data, walletTransactionType);
                    }
                }
            } else {
                res.flag = true;
            }

            if (res.flag) {
                if (sails.config.PARTNER_WITH_CLIENT_FEATURE_ACTIVE) {
                    await FranchiseeService.creditRideFareToFranchiseeWallet(rideTotalFare, ride.franchiseeId);
                } else if (sails.config.CLIENT_FEATURE_ACTIVE) {
                    await DealerService.creditRideFareToDealerWallet(rideTotalFare, ride.dealerId);
                }
                let rideData = await RideBooking.update(
                    { id: ride.id },
                    { isPaid: true, updatedBy: ride.userId }
                ).fetch();

                const RideBookingService = require(`./rideBooking`);
                await RideBookingService.updateRideSummary(rideData[0]);
            }
            console.log('****** chargeCustomerForRide Ends *******', ride.id);

            return res;
        } catch (e) {
            throw e;
        }
    },

    async chargeCustomerForPlanUsingWallet(planInvoiceId, planPrice, userId) {
        console.log("****** chargeCustomerForPlanUsingWallet starts ******");
        console.log("planInvoiceId: ", planInvoiceId, " userId: ", userId)
        try {
            let res = { flag: false };
            let data;

            const walletConfig = await WalletService.getWalletConfig();
            const { isWalletEnable } = walletConfig;
            if (!isWalletEnable) {
                throw sails.config.message.WALLET_NOT_ENABLED;
            }
            data = await WalletService.chargeCustomerForPlan(planInvoiceId, planPrice, userId);
            console.log("chargeCustomerForPlanUsingWallet -> data", data)
            const walletTransactionType =
                sails.config.STRIPE.TRANSACTION_TYPE.DEBIT;
            res = await this.transactionLog(data, walletTransactionType);

            console.log("****** chargeCustomerForPlanUsingWallet Ends ******");

            return res;
        } catch (e) {
            throw e;
        }
    },

    async refundCustomerForPlan(planInvoiceId, planPrice, userId) {
        console.log("****** refundCustomerWalletForCancelPlan starts ******");
        console.log("planInvoiceId: ", planInvoiceId, " userId: ", userId, " price: ", planPrice);
        try {
            let res = { flag: false };
            let data = await WalletService.refundCustomerForPlan(planInvoiceId, planPrice, userId)
            res = await this.transactionLog(data, sails.config.STRIPE.TRANSACTION_TYPE.CREDIT);

            return res;
        } catch (e) {
            throw e;
        }
    },

    async transactionLog(data, walletTransactionType) {
        let {
            franchiseeId, dealerId,
            chargeObj, userId, rideId, rideCost, transactionSuccess,
            userCards, errorData, failedTransactionId, isWalletTransaction,
            transactionFees, transactionCard, transactionAmount,
            paymentTransactionId, rideNumber, isRideDepositTransaction,
            isSystemTransaction, proxyPayReferenceId, expiryDate, statusTrack,
            planInvoiceId, rideType, bonusTransactionId, inicisDetails, inicisData,
            isWalletPromoCodeTransaction, promoCode
        } = data;
        if (!rideType) {
            rideType = sails.config.RIDE_TYPE.DEFAULT;
        }
        let rideObj;
        if (rideId) {
            rideObj = await RideBooking.findOne({ id: rideId }).select(['fareSummary']);
        }
        let isExtraTakenTimePlanPayment = false;
        if (rideObj && rideObj.fareSummary && rideObj.fareSummary.bookPlanExtraTakenTime
            && rideObj.fareSummary.bookPlanExtraTakenTime > 0) {
            isExtraTakenTimePlanPayment = true;
            console.log(rideObj.id, " -> isExtraTakenTimePlanPayment", isExtraTakenTimePlanPayment);
        }
        if (rideObj && rideObj.fareSummary && rideObj.fareSummary.bookingPassExtraTimeUsed
            && rideObj.fareSummary.bookingPassExtraTimeUsed > 0) {
            isExtraTakenTimePlanPayment = true;
            console.log(rideObj.id, " -> isExtraTakenTimePlanPayment", isExtraTakenTimePlanPayment);
        }
        const walletData = {
            isWalletTransaction,
            walletTransactionType,
            userId,
            rideNumber,
            isSystemTransaction: !!isSystemTransaction,
            bonusTransactionId,
            isWalletPromoCodeTransaction
        };
        let transactionDebitLog;
        try {
            if (transactionSuccess) {
                let transactionObj = {
                    chargeType:
                        sails.config.TRANSACTION_LOG.STATUS.RIDE_COMPLETED,
                    transactionBy: userId,
                    amount: transactionAmount,
                    paymentTransactionId: paymentTransactionId,
                    rideId: rideId,
                    status: sails.config.STRIPE.STATUS[chargeObj.status],
                    fees: transactionFees,
                    type: sails.config.STRIPE.TRANSACTION_TYPE.DEBIT,
                    remark:
                        sails.config.STRIPE.MESSAGE.RIDE_REQUEST_DONE_CHARGE,
                    card: transactionCard,
                    proxyPayReferenceId: proxyPayReferenceId,
                    planInvoiceId: planInvoiceId,
                    rideType: rideType,
                    expiryDate: expiryDate,
                    statusTrack: statusTrack,
                    bonusTransactionId: bonusTransactionId,
                    inicisData: inicisData,
                    promoCodeId: (promoCode && promoCode.id) ? promoCode.id : null,
                    promoCodeData: promoCode
                };
                transactionObj = this.handleTransactionType(
                    transactionObj,
                    walletData,
                    isRideDepositTransaction,
                    rideType,
                    isExtraTakenTimePlanPayment
                );
                if (sails.config.IS_FRANCHISEE_ENABLED && franchiseeId) {
                    transactionObj.franchiseeId = franchiseeId;
                    data.userType = sails.config.USER.TYPE.FRANCHISEE;
                }
                if (dealerId) {
                    transactionObj.dealerId = dealerId;
                    data.userType = sails.config.USER.TYPE.DEALER;
                }
                console.log("transactionLog -> transactionObj", transactionObj)
                /** Store Transaction Log for customer debit**/
                transactionDebitLog = await TransactionLog.create(transactionObj).fetch();
                // todo:fix
                if (transactionObj.chargeType !== sails.config.TRANSACTION_LOG.STATUS.WALLET_CREDIT) {
                    await this.sendMailSMSAndPushNotification(
                        transactionSuccess,
                        transactionDebitLog.id,
                        userId,
                        transactionAmount,
                        null,
                        rideType
                    );
                }
                console.log('transactionDebitLog success');
                console.log(transactionDebitLog);
                console.log('transactionDebitLog success');
            } else {
                console.log("chargeObj---------------------", chargeObj);
                let transactionObj = {
                    chargeType: sails.config.TRANSACTION_LOG.STATUS.RIDE_COMPLETED,
                    transactionBy: userId,
                    rideId: rideId,
                    amount: rideCost ? rideCost : 0,
                    paymentTransactionId: failedTransactionId ? failedTransactionId : '',
                    status: sails.config.STRIPE.STATUS[chargeObj.status],
                    type: sails.config.STRIPE.TRANSACTION_TYPE.DEBIT,
                    remark: sails.config.STRIPE.MESSAGE.RIDE_REQUEST_DONE_CHARGE,
                    card: _.find(userCards, { isPrimary: true }),
                    proxyPayReferenceId: proxyPayReferenceId,
                    expiryDate: expiryDate,
                    planInvoiceId: planInvoiceId,
                    rideType: rideType,
                    statusTrack: statusTrack,
                    bonusTransactionId: bonusTransactionId,
                    inicisData: inicisData
                };
                transactionObj = this.handleTransactionType(
                    transactionObj,
                    walletData,
                    isRideDepositTransaction,
                    rideType,
                    isExtraTakenTimePlanPayment
                );
                if (sails.config.IS_FRANCHISEE_ENABLED && franchiseeId) {
                    transactionObj.franchiseeId = franchiseeId;
                    data.userType = sails.config.USER.TYPE.FRANCHISEE;
                }
                if (dealerId) {
                    transactionObj.dealerId = dealerId;
                    data.userType = sails.config.USER.TYPE.DEALER;
                }
                let transactionLog = await TransactionLog.create(transactionObj).fetch();
                if (transactionObj.chargeType !== sails.config.TRANSACTION_LOG.STATUS.WALLET_CREDIT) {
                    await this.sendMailSMSAndPushNotification(
                        transactionSuccess,
                        transactionLog.id,
                        userId,
                        0,
                        errorData.message,
                        rideType
                    );
                }
            }

            let transactionData = transactionSuccess ? transactionDebitLog : errorData;

            return { flag: transactionSuccess, data: transactionData };
        } catch (e) {
            console.log('payment error --- ', e);
            throw e;
        }
    },

    handleTransactionType(transactionObj, walletData, isRideDepositTransaction, rideType, isExtraTakenTimePlanPayment) {
        const {
            isWalletTransaction,
            walletTransactionType,
            userId,
            rideNumber,
            isSystemTransaction,
            bonusTransactionId,
            isWalletPromoCodeTransaction
        } = walletData;
        if (isWalletTransaction) {
            transactionObj.isWalletTransaction = true;
            transactionObj.type = walletTransactionType;
            const isWalletCredit = walletTransactionType ===
                sails.config.STRIPE.TRANSACTION_TYPE.CREDIT;
            if (isWalletCredit) {
                transactionObj.transactionTo = userId;
                transactionObj.chargeType =
                    sails.config.TRANSACTION_LOG.STATUS.WALLET_CREDIT;
                if (transactionObj.status == sails.config.STRIPE.STATUS.pending) {
                    transactionObj.remark = sails.config.STRIPE.MESSAGE.CREDIT_WALLET_PENDING;
                } else {
                    transactionObj.remark = sails.config.STRIPE.MESSAGE.CREDIT_WALLET_DONE;
                }
            } else {
                transactionObj.chargeType =
                    sails.config.TRANSACTION_LOG.STATUS.WALLET_DEBIT;
                transactionObj.remark = sails.config.STRIPE.MESSAGE.DEBIT_WALLET_DONE +
                    rideNumber || '';
            }
            if (isSystemTransaction) {
                transactionObj.remark = sails.config.STRIPE.MESSAGE.NEW_CUSTOMER_WALLET_CREDIT;
                transactionObj.type = sails.config.STRIPE.TRANSACTION_TYPE.CREDIT;
            }
            if (rideType === sails.config.RIDE_TYPE.SUBSCRIPTION && isSystemTransaction) {
                transactionObj.remark = sails.config.STRIPE.MESSAGE.REFUND_BOOK_PLAN;
                transactionObj.refunded = true;
            } else if (rideType === sails.config.RIDE_TYPE.SUBSCRIPTION) {
                if (!isExtraTakenTimePlanPayment) {
                    transactionObj.remark = sails.config.STRIPE.MESSAGE.PLAN_BUY_DONE;
                } else {
                    transactionObj.remark = sails.config.STRIPE.MESSAGE.EXTRA_TIME_PLAN_PAYMENT;
                }
            }
            if (rideType === sails.config.RIDE_TYPE.BOOKING_PASS) {
                if (!isExtraTakenTimePlanPayment) {
                    transactionObj.remark = sails.config.STRIPE.MESSAGE.PLAN_BUY_DONE;
                } else {
                    transactionObj.remark = sails.config.STRIPE.MESSAGE.EXTRA_TIME_PLAN_PAYMENT;
                }
            }
            if (isSystemTransaction && bonusTransactionId) {
                transactionObj.remark = sails.config.STRIPE.MESSAGE.BONUS_CREDIT;
            }
            if (isWalletPromoCodeTransaction) {
                transactionObj.chargeType = sails.config.TRANSACTION_LOG.STATUS.PROMO_CODE_WALLET;
                transactionObj.remark = sails.config.STRIPE.MESSAGE.BONUS_CREDIT;
            }
        }
        if (isRideDepositTransaction) {
            transactionObj.remark = sails.config.STRIPE.MESSAGE.RIDE_DEPOSIT_DONE_CHARGE;
            transactionObj.chargeType =
                sails.config.TRANSACTION_LOG.STATUS.RIDE_DEPOSIT;
        }

        return transactionObj;
    },

    async sendMailSMSAndPushNotification(transactionSuccess, id, userId, amount, errorMessage, rideType = sails.config.RIDE_TYPE.DEFAULT) {
        let obj = {
            mail: {
                template: 'common',
                subject: 'Ride - Payment',
                message: ''
            },
            pushNotification: {
                data: {
                    transactionId: id,
                    module: sails.config.modules.transactionlog
                },
                content: ''
            },
            sms: { content: '' },
            action:
                sails.config.SETTINGS.ACTIONS[
                'RIDE_BOOKING.CUSTOMER.PAYMENT_RIDE'
                ]
        };
        if (transactionSuccess) {
            if (rideType === sails.config.RIDE_TYPE.DEFAULT) {
                obj.mail.message = `You have been charged of ${amount} ${sails.config.CURRENCY_SYM} for ride.`;
            } else if (rideType === sails.config.RIDE_TYPE.SUBSCRIPTION) {
                obj.mail.message = `You have been charged of ${amount} ${sails.config.CURRENCY_SYM} for plan.`;
            }
        } else {
            if (rideType === sails.config.RIDE_TYPE.DEFAULT) {
                obj.mail.message = `Your payment of ride has been failed. Due to ${errorMessage}`;
            } else if (rideType === sails.config.RIDE_TYPE.SUBSCRIPTION) {
                obj.mail.message = `Your payment of plan has been failed. Due to ${errorMessage}`;
            }
        }
        obj.pushNotification.content = obj.mail.message;
        obj.sms.content = obj.mail.message;
        obj.users = [userId];
        await CommonService.sendMailSMSAndPushNotification(obj);
    },

    async sendAddWalletMail(transaction) {
        let message = `${transaction.amount} has been successfully added in your ${sails.config.PROJECT_NAME} wallet`
        transaction.mailContent = message;
        transaction.createdAt = await UtilService.formatDate(transaction.createdAt);
        let obj = {
            mail: {
                template: 'addWallet',
                subject: message,
                message: message,
                data: transaction
            },
            pushNotification: {
                data: {
                    transactionId: transaction.id,
                    module: sails.config.modules.transactionlog
                },
                content: message
            },
            sms: { content: '' },
            action: sails.config.SETTINGS.ACTIONS['PAYMENT.ADD_WALLET']
        };
        obj.users = [transaction.transactionBy];
        await CommonService.sendMailSMSAndPushNotification(obj);
    },

    async makeStripeIdAndCardEmpty(id) {
        await User.update({ id: id }, {
            stripeCustomerId: '',
            cards: null,
            isStripeModificationDone: true
        });
    },

    async updateNoqoodyTransactions(fromDate, toDate = null) {
        let status = [
            sails.config.STRIPE.STATUS.expired,
            sails.config.STRIPE.STATUS.pending,
            sails.config.STRIPE.STATUS.failed
        ];
        console.log('fromDate', fromDate);
        let query = {
            status: status,
            noqoodyReferenceId: { '!=': '' },
            createdAt: { '>=': fromDate }
        }
        if (toDate) {
            query.createdAt['<='] = toDate;
        }
        let transactions = await TransactionLog.find(query);
        for (let transaction of transactions) {
            if (!transaction) {
                continue;
            }
            try {
                await NoqoodyService.validatePayment(transaction.noqoodyReferenceId, 1, true);
            } catch (e) {
                console.log('updateNoqoodyTransactions e', e);
            }
        }
    },

    async updateStatusForNoqoodyTransactionViaReferenceIds(noqoodyReferenceIds) {
        let status = [
            sails.config.STRIPE.STATUS.expired,
            sails.config.STRIPE.STATUS.pending,
            sails.config.STRIPE.STATUS.failed
        ];
        // console.log('fromDate', fromDate);
        let query = {
            status: status,
            noqoodyReferenceId: noqoodyReferenceIds
        }
        let transactions = await TransactionLog.find(query);
        console.log('transactions', transactions.length);
        for (let transaction of transactions) {
            if (!transaction) {
                continue;
            }
            try {
                await NoqoodyService.validatePayment(transaction.noqoodyReferenceId, 1, true);
            } catch (e) {
                console.log('updateNoqoodyTransactions e', e);
            }
        }
    },

    afterCreate: async function () {
    },
    afterUpdate: async function () {
    },
    afterDestroy: async function () {
    },
};
