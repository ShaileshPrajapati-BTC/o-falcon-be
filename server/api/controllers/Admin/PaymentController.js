const modelName = 'vehicle';
const UtilService = require(`${sails.config.appPath}/api/services/util`);
const CommonService = require(`${sails.config.appPath}/api/services/common`);
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const uuid = require('uuid');
const StripeHandlerService = require(`${sails.config.appPath}/api/services/Payment/Stripe/stripeHandler`);
const moment = require("moment");
module.exports = {


    async paginate(req, res) {
        try {
            // get filter
            let params = req.allParams();
            let filter = await common.getFilter(params);
            if (req.user.type === sails.config.USER.TYPE.FRANCHISEE) {
                filter.where.dealerId = null;
            }
            let recordsList = await TransactionLog.find(filter)
                .populate('transactionBy', { select: ['name', 'emails', 'mobiles', 'firstName', 'lastName', 'image'] })
                .populate('transactionTo', { select: ['name', 'emails', 'mobiles', 'firstName', 'lastName', 'image'] })
                .populate('rideId', { select: ['rideNumber', 'fareSummary', 'isPromoCodeApplied', 'promoCodeText', 'promoCodeAmount', 'franchiseeCommission'] })
                .populate('addedBy', { select: ['name', 'emails', 'mobiles', 'firstName', 'lastName', 'image'] })
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name'] })
                .meta({ enableExperimentalDeepTargets: true });
            if (!recordsList.length) {
                return res.ok({ list: [] }, sails.config.message.LIST_NOT_FOUND);
            }
            if (sails.config.IS_MASK == true) {
                _.each(recordsList, (data) => {
                    let transactionBy = data.transactionBy;
                    if (transactionBy && transactionBy.emails) {
                        let primaryEmail = UtilService.getPrimaryEmail(transactionBy.emails);

                        _.each(transactionBy.emails, (email) => {
                            email.email = CommonService.emailMasking(primaryEmail);
                        });
                    }
                    if (transactionBy && transactionBy.mobiles) {
                        let primaryMobile = UtilService.getPrimaryValue(transactionBy.mobiles, 'mobile');
                        _.each(transactionBy.mobiles, (mobile) => {
                            mobile.mobile = CommonService.phoneNoMasking(primaryMobile);
                        });
                    }
                });
            }
            let response = { list: recordsList };
            // count
            let countFilter = await common.removePagination(filter);
            response.count = await TransactionLog.count(countFilter)
                .meta({ enableExperimentalDeepTargets: true });

            return res.ok(response, sails.config.message.OK, modelName);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async addBankAccount(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            if (!params || !params.userId || !params.bankDetails
                || !params.bankDetails.bankId || !params.bankDetails.accountNumber
                || !params.bankDetails.routingNumber || !params.bankDetails.accountHolderName) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let user = await User.findOne({ id: params.userId });
            if (!user) {
                return res.ok({}, sails.config.message.USER_LIST_NOT_FOUND);
            }
            let bankAccountNumber = _.find(user.bankAccountDetails, { accountNumber: params.bankDetails.accountNumber });
            if (bankAccountNumber) {
                return res.badRequest(null, sails.config.message.BANK_ACCOUNT_NUMBER_DUPLICATE);
            }

            let routingNumber = _.find(user.bankAccountDetails, { routingNumber: params.bankDetails.routingNumber });
            if (routingNumber) {
                return res.badRequest(null, sails.config.message.ROUTING_NUMBER_DUPLICATE);
            }

            params.bankDetails.isPrimary = false;
            params.bankDetails.id = uuid();
            if (!user.bankAccountDetails.length) {
                params.bankDetails.isPrimary = true;
            }
            if (!user.bankAccountDetails) {
                user.bankAccountDetails = [];
            }
            user.bankAccountDetails.push(params.bankDetails);
            let newData = {
                bankAccountDetails: user.bankAccountDetails,
                updatedBy: loggedInUser.id
            }
            let updateBankDetails = await User.update({ id: user.id }, newData).fetch();
            if (updateBankDetails && updateBankDetails.length) {
                return res.ok(updateBankDetails, sails.config.message.STRIPE_BANK_ACCOUNT_SUCCESS)
            }
            return res.serverError(params.bankDetail, sails.config.message.SERVER_ERROR)
        } catch (e) {
            console.log(e);

            return res.serverError(null, sails.config.message.LIST_NOT_FOUND);
        }
    },

    async setDefaultBankAccount(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        if (!params || !params.userId || !params.bankAccountId) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let user = await User.findOne({ id: params.userId });
            if (!user) {
                return res.ok({}, sails.config.message.USER_LIST_NOT_FOUND);
            }
            let bank = _.find(user.bankAccountDetails, { id: params.bankAccountId })
            if (!bank) {
                return res.ok({}, sails.config.message.STRIPE_BANK_ACCOUNT_NOT_FOUND);
            }
            let isPrimary = _.find(user.bankAccountDetails, { isPrimary: true })
            if (user.bankAccountDetails) {
                let newDetails = [];
                _.each(user.bankAccountDetails, (bd) => {
                    if (isPrimary) {
                        bd.isPrimary = false;
                    }
                    if (bd.id === params.bankAccountId) {
                        bd.isPrimary = true
                    }
                    newDetails.push(bd);
                });
                let newData = {
                    bankAccountDetails: newDetails,
                    updatedBy: loggedInUser.id
                }
                await User.update({ id: user.id }, newData);
                return res.ok({}, sails.config.message.STRIPE_BANK_ACCOUNT_DEFAULT)
            } else {
                return res.serverError({}, sails.config.message.LIST_NOT_FOUND);
            }
        } catch (e) {
            console.log(e.message);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async removeBankAccount(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        if (!params || !params.userId || !params.bankAccountId) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let user = await User.findOne({ id: params.userId });
            if (!user) {
                return res.ok({}, sails.config.message.USER_LIST_NOT_FOUND);
            }
            let bankAccount = _.filter(user.bankAccountDetails, { id: params.bankAccountId });
            if (!bankAccount.length) {
                return res.ok({}, sails.config.message.STRIPE_BANK_ACCOUNT_NOT_FOUND);
            }
            let primaryAccount = _.find(user.bankAccountDetails, { id: params.bankAccountId, isPrimary: true });
            let secondaryAccounts = _.filter(user.bankAccountDetails, { isPrimary: false });
            let secondaryAccount = secondaryAccounts[0];
            //can not remove default account if no secondary account exists
            if (primaryAccount || !secondaryAccounts || _.size(secondaryAccounts) === 0) {
                return res.ok({}, sails.config.message.STRIPE_BANK_ACCOUNT_DEFAULT_REMOVE)
            }
            let newDetails = [];
            _.each(user.bankAccountDetails, (bd) => {
                if (bd.id !== params.bankAccountId) {
                    if (primaryAccount && bd.id === secondaryAccount.bankAccountId) {//make secondary account primary
                        bd.isPrimary = true;
                    }
                    newDetails.push(bd);
                } else {
                    //removed the account, so don't push it
                }
            });
            let newData = {
                bankAccountDetails: newDetails,
                updatedBy: loggedInUser.id
            }
            await User.update({ id: user.id }, newData);
            return res.ok({}, sails.config.message.STRIPE_BANK_ACCOUNT_REMOVED)

        } catch (e) {
            console.log(e.message);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async updateBankAccount(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        if (!params || !params.userId || !params.bankDetails.bankAccountId
            || !params.bankDetails.bankId || !params.bankDetails.accountNumber
            || !params.bankDetails.routingNumber || !params.bankDetails.accountHolderName) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let user = await User.findOne({ id: params.userId });
            if (!user) {
                return res.ok({}, sails.config.message.USER_LIST_NOT_FOUND);
            }

            let bankFound = _.find(user.bankAccountDetails, { id: params.bankDetails.bankAccountId })
            if (!bankFound) {
                return res.badRequest(null, sails.config.message.STRIPE_BANK_ACCOUNT_NOT_FOUND);
            }

            let bankAccountNumber = user.bankAccountDetails.filter(bank => {
                return (bank.id !== params.bankDetails.bankAccountId &&
                    bank.accountNumber === params.bankDetails.accountNumber)
            });
            if (bankAccountNumber.length) {
                return res.badRequest(null, sails.config.message.BANK_ACCOUNT_NUMBER_DUPLICATE);
            }

            let routingNumber = user.bankAccountDetails.filter(bank => {
                return (bank.id !== params.bankDetails.bankAccountId &&
                    bank.routingNumber === params.bankDetails.routingNumber)
            });
            if (routingNumber.length) {
                return res.badRequest(null, sails.config.message.ROUTING_NUMBER_DUPLICATE);
            }

            let newDetails = [];
            let newBank = {};
            _.each(user.bankAccountDetails, (bd) => {
                if (bd.id === params.bankDetails.bankAccountId) {
                    newBank.bankId = params.bankDetails.bankId;
                    newBank.accountNumber = params.bankDetails.accountNumber;
                    newBank.accountHolderName = params.bankDetails.accountHolderName;
                    newBank.routingNumber = params.bankDetails.routingNumber;
                    Object.assign(bd, newBank)
                }
                newDetails.push(bd);
            });
            let newData = {
                bankAccountDetails: newDetails,
                updatedBy: loggedInUser.id
            }
            let updateBankDetails = await User.update({ id: user.id }, newData).fetch();
            if (updateBankDetails && updateBankDetails.length) {
                return res.ok(updateBankDetails, sails.config.message.STRIPE_BANK_ACCOUNT_UPDATE_SUCCESS)
            }
            return res.serverError(params.bankDetail, sails.config.message.SERVER_ERROR)
        } catch (e) {
            console.log(e);
            return res.serverError({}, e)
        }
    },

    async userBankAccount(req, res) {
        let params = req.allParams();
        if (!params || !params.userId) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        let newDetails = [];
        try {
            let user = await User.findOne({ id: params.userId });
            if (!user) {
                return res.ok({}, sails.config.message.USER_LIST_NOT_FOUND);
            }
            if (!user.bankAccountDetails.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            if (user.bankAccountDetails && user.bankAccountDetails.length) {
                await Promise.all(_.map(user.bankAccountDetails, async (bd) => {
                    let newBank = await Master.findOne({
                        where: { id: bd.bankId },
                        select: ['name', 'code']
                    });
                    bd.bankId = newBank ? newBank : {};
                    newDetails.push(bd);

                }));
                let response = {
                    list: newDetails
                };
                response.count = newDetails.length;
                return res.ok(response, sails.config.message.OK);
            }
            return res.ok({}, sails.config.message.LIST_NOT_FOUND);
        } catch (e) {
            console.log(e);
            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },
    async handleStripeAccounts(req, res) {
        try {
            let params = req.allParams();

            if (!params.privateKey || !('updateAll' in params) || params.privateKey !== 'HandleSTRIPE-2020') {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            const { updateAll } = params;
            let users = [];
            if (updateAll) {
                // update all stripeIds
                users = await User.find();
                _.forEach(users, async (user) => {
                    console.log('---- updating stripeId for ---- ', user.id);
                    await PaymentService.createStripeCustomer(user);
                });
            } else {
                // create all stripeIds where null
                users = await User.find({
                    or: [
                        { stripeCustomerId: "" },
                        { stripeCustomerId: null }
                    ]
                });
                _.forEach(users, async (user) => {
                    console.log('---- generating stripeId for ---- ', user.id);
                    await PaymentService.createStripeCustomer(user);
                });
            }

            return res.ok({}, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async emptyStripeIds(req, res) {
        try {
            let params = req.allParams();
            let makeIdNullForAll = false;
            if ('makeIdNullForAll' in params) {
                makeIdNullForAll = params.makeIdNullForAll;
            }
            let users = await User.find({
                isStripeModificationDone: false
            }).select(['stripeCustomerId']);
            if (makeIdNullForAll) {
                _.forEach(users, async (user) => {
                    await PaymentService.makeStripeIdAndCardEmpty(user.id);
                });
            } else {
                _.forEach(users, async (user) => {
                    if (user.stripeCustomerId === '' || !user.stripeCustomerId) {
                        return;
                    }
                    try {
                        let stripeObj = await StripeHandlerService.getStripeObject();
                        await stripeObj.customers.retrieve(user.stripeCustomerId || '');
                        await User.update({ id: user.id }, {
                            isStripeModificationDone: true
                        });
                    } catch (error) {
                        // console.log("emptyStripeIds -> error", error)
                        await PaymentService.makeStripeIdAndCardEmpty(user.id);
                    }
                });
            }
            return res.ok({}, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async debitWallet(req, res) {
        try {
            let loginUser = req.user;
            let where = {
                isDeleted: false,
                type: sails.config.USER.TYPE.CUSTOMER,
                walletAmount: { ">": 0 }
            }
            let users = await User.find({ where }).select(['walletAmount']);
            await Promise.all(_.map(users, async (data) => {
                await User.update({ id: data.id }).set({
                    walletAmount: 0
                });
                let statusTrack = [
                    {
                        "status": sails.config.STRIPE.STATUS['succeeded'],
                        "remark": "System debit wallet.",
                        "datetime": moment().toISOString()
                    }
                ]
                let transactionObj = {
                    userType: sails.config.USER.TYPE.CUSTOMER,
                    chargeType: sails.config.TRANSACTION_LOG.STATUS.WALLET_DEBIT,
                    transactionBy: data.id,
                    amount: data.walletAmount,
                    status: sails.config.STRIPE.STATUS['succeeded'],
                    type: sails.config.STRIPE.TRANSACTION_TYPE.DEBIT,
                    addedBy: loginUser.id,
                    isWalletTransaction: true,
                    remark: "System debited wallet.",
                    statusTrack: statusTrack
                };
                await TransactionLog.create(transactionObj);
            })
            )
            console.log('wallet debited sucsess------- :>> ');
            return res.ok({}, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },
    async updateStatusForNoqoodyTransaction(req, res) {
        let params = req.allParams();
        if (!params || !params.fromDate) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            await PaymentService.updateNoqoodyTransactions(params.fromDate, params.toDate);

            let response = {};
            return res.ok(response, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, e);
        }
    },
    async updateStatusForNoqoodyTransactionViaReferenceIds(req, res) {
        let params = req.allParams();
        if (!params || !params.referenceIds || !params.referenceIds.length) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            await PaymentService.updateStatusForNoqoodyTransactionViaReferenceIds(params.referenceIds);

            let response = {};
            return res.ok(response, sails.config.message.OK);
        } catch (e) {
            console.log(e);
            return res.serverError(null, e);
        }
    },
}