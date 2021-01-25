const UtilService = require('../../util');
const CommonService = require('../../common');
const StripeHandler = require('./stripeHandler');
module.exports = {
    /** Customer **/
    async createCustomer(userId, email, phone, description) {
        try {
            console.log('in stripe customer');
            // create a stripe customer account
            let stripeObj = await StripeHandler.getStripeObject();
            let createParams = {};
            if (email) {
                createParams.email = email;
            } else if (phone) {
                createParams.phone = phone;
            }
            if (description) {
                createParams.description = description;
            }
            console.log("createCustomer -> createParams", createParams)
            let customer = await stripeObj.customers.create(createParams);
            // update user with customer id
            await User.update(
                { id: userId },
                { stripeCustomerId: customer.id }
            );
            if (sails.config.IS_ADD_DUMMY_CARD) {
                let loggedInUser = await User.findOne({ id: userId });
                let card = await this.addDummyCardToCustomer(customer.id);
                let cardObj = {
                    expMonth: card.exp_month,
                    expYear: card.exp_year,
                    last4: card.last4,
                    first4: card.first4,
                    brand: card.brand,
                    id: card.id,
                    cardToken: card.cardToken
                };
                if (!loggedInUser.cards || _.size(loggedInUser.cards) === 0) {
                    cardObj.isPrimary = true;
                    loggedInUser.cards = [];
                }

                loggedInUser.cards.push(cardObj);

                /** update user with card object **/
                await User.update({ id: loggedInUser.id }, { cards: loggedInUser.cards });
            }

            return true;
        } catch (e) {
            throw new Error(e);
        }
    },
    async addCardToCustomer(customerId, token) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.customers.createSource(
                customerId,
                { source: token });
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async addDummyCardToCustomer(customerId) {
        try {
            console.log('in addDummyCardToCustomer', customerId);
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.customers.createSource(
                customerId,
                { source: 'tok_visa' }
            );
        } catch (e) {
            sails.log.error('addDummyCardToCustomer err', e.message);
            throw new Error(e);
        }
    },
    async setDefaultCustomerCard(customerId, cardId) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.customers.update(
                customerId,
                { default_source: cardId }
            );
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async retrieveCustomer(customerId) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.customers.retrieve(
                customerId
            );
        } catch (e) {
            sails.log.error(e);
            throw new Error(e);
        }
    },
    async updateCustomerCard(customerId, cardId, cardDetails) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.customers.updateCard(
                customerId,
                cardId,
                { exp_month: cardDetails.expMonth, exp_year: cardDetails.exp_year });
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async removedCardFromCustomer(customerId, cardId) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.customers.deleteSource(
                customerId,
                cardId
            );
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async chargeCardVerifyAmount(customerId, cardId, amount) {
        let user = await User.findOne({ stripeCustomerId: customerId });
        user.email = UtilService.getPrimaryEmail(user.emails);
        try {
            let stripeObj = await StripeHandler.getStripeObject();
            let chargeObj = await stripeObj.charges.create({
                amount: amount * 100, // amount should be in cents
                currency: sails.config.CURRENCY_CODE,
                customer: customerId,
                card: cardId
            });

            if (chargeObj) {
                let transactionObj = await this.retrieveTransaction(chargeObj.balance_transaction);
                let tax = 0;
                let taxData = _.find(transactionObj.fee_details, { type: 'tax' });
                if (taxData && taxData.amount) {
                    tax = taxData.amount / 100;
                }
                /** Store Transaction Log **/
                await TransactionLog.create({
                    chargeType: sails.config.TRANSACTION_LOG.STATUS.CARD_VERIFY,
                    transactionBy: user.id,
                    amount: chargeObj.amount / 100, // convert cents to dollar
                    paymentTransactionId: chargeObj.id,
                    status: sails.config.STRIPE.STATUS[chargeObj.status],
                    type: sails.config.STRIPE.TRANSACTION_TYPE.DEBIT,
                    remark: sails.config.STRIPE.MESSAGE.CARD_VERIFY_AMOUNT,
                    fees: {
                        totalFee: transactionObj.fee / 100,
                        stripeFee: _.find(transactionObj.fee_details, { type: 'stripe_fee' }).amount / 100,
                        tax: tax
                    },
                    card: {
                        expMonth: chargeObj.source.exp_month,
                        expYear: chargeObj.source.exp_year,
                        last4: chargeObj.source.last4,
                        brand: chargeObj.source.brand,
                        id: chargeObj.source.id
                    }
                });
                /** Store transaction log for admin credit **/
                let transactionLog = await TransactionLog.create({
                    chargeType: sails.config.TRANSACTION_LOG.STATUS.CARD_VERIFY,
                    transactionBy: user.id,
                    amount: (chargeObj.amount - transactionObj.fee) / 100, // convert cents to dollar and cut charge fees
                    paymentTransactionId: chargeObj.id,
                    status: sails.config.STRIPE.STATUS[chargeObj.status],
                    type: sails.config.STRIPE.TRANSACTION_TYPE.CREDIT,
                    remark: sails.config.STRIPE.MESSAGE.CARD_VERIFY_AMOUNT,
                    card: {
                        expMonth: chargeObj.source.exp_month,
                        expYear: chargeObj.source.exp_year,
                        last4: chargeObj.source.last4,
                        brand: chargeObj.source.brand,
                        id: chargeObj.source.id
                    }
                }).fetch();
                // send push notification for failure of card payment
                let obj = {
                    mail: {
                        template: 'common',
                        subject: 'Card Verify - Payment',
                        message: ''
                    },
                    pushNotification: {
                        data: {
                            transactionId: transactionLog.id,
                            module: sails.config.modules.transactionlog
                        },
                        content: ''
                    },
                    sms: { content: '' },
                    action: sails.config.SETTINGS.ACTIONS['PAYMENT.CUSTOMER.CARD_VERIFY']
                };
                obj.mail.message = `You have been charged of ${chargeObj.amount / 100} ${sails.config.CURRENCY_SYM} to verify your card that ends with ${chargeObj.source.last4}.`;
                obj.pushNotification.content = obj.mail.message;
                obj.sms.content = obj.mail.message;
                obj.users = [customerId];
                await CommonService.sendMailSMSAndPushNotification(obj);
            }

            return chargeObj;
        } catch (e) {
            sails.log.error(e.message);
            let transactionLog = await TransactionLog.create({
                chargeType: sails.config.TRANSACTION_LOG.STATUS.CARD_VERIFY,
                transactionBy: user.id,
                amount: amount,
                paymentTransactionId: e.raw.charge,
                status: sails.config.STRIPE.STATUS['failed'],
                type: sails.config.STRIPE.TRANSACTION_TYPE.DEBIT,
                remark: sails.config.STRIPE.MESSAGE.CARD_VERIFY_AMOUNT,
                card: _.find(user.cards, { isPrimary: true })
            }).fetch();
            // send push notification for failure of card payment
            let obj = {
                mail: {
                    template: 'common',
                    subject: 'Card Verify - Payment',
                    message: ''
                },
                pushNotification: {
                    data: {
                        transactionId: transactionLog.id,
                        module: sails.config.modules.transactionlog
                    },
                    content: ''
                },
                sms: { content: '' },
                action: sails.config.SETTINGS.ACTIONS['PAYMENT.CUSTOMER.CARD_VERIFY']
            };
            obj.mail.message = `Deduction of charge to verify your card has failed. Due to ${e.message}`;
            obj.pushNotification.content = obj.mail.message;
            obj.sms.content = obj.mail.message;
            obj.users = [customerId];
            await CommonService.sendMailSMSAndPushNotification(obj);

            return e;
        }
    },
    async updateAccountDetails(accountNo, address) {
        try {
            if (address) {
                let stripeObj = await StripeHandler.getStripeObject();
                // create a cleaner account on stripe
                await stripeObj.accounts.update(accountNo, {
                    legal_entity: {
                        address: {
                            line1: address.line1 ? address.line1 : '',
                            postal_code: address.pincode ? address.pincode : '',
                            city: address.city ? address.city : '',
                            state: address.state ? address.state : ''
                        }
                    }
                });
            }
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async retrieveAccountDetailsAccount(accountNo) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.accounts.retrieve(accountNo);
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async createExternalBankAccount(accountNo, token) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.accounts.createExternalAccount(accountNo, { external_account: token });
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async updateBankAccount(accountNo, bankAccountId) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.accounts.updateExternalAccount(
                accountNo,
                bankAccountId,
                { default_for_currency: true });
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async removeBankAccount(accountNo, bankAccountId) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.accounts.deleteExternalAccount(accountNo, bankAccountId);
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async createTransfer(rideBooking, amountToBePaid) {
        try {
            let user = await User.findOne({ id: rideBooking.cleanerId });
            let stripeObj = await StripeHandler.getStripeObject();
            let transferObj = await stripeObj.transfers.create({
                amount: amountToBePaid * 100, // amount should be in cents
                currency: sails.config.CURRENCY_CODE,
                destination: user.stripeAccountNo
            });

            return transferObj;
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    async createPayout(rideBooking, amountToBePaid) {
        try {
            let user = await User.findOne({ where: { id: rideBooking.cleanerId }, select: ['stripeAccountNo'] });

            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.payouts.create({
                amount: amountToBePaid * 100, // amount should be in cents
                currency: sails.config.CURRENCY_CODE
            }, { stripe_account: user.stripeAccountNo });
        } catch (e) {
            sails.log.error(e.message);
            throw new Error(e);
        }
    },
    /** test stripe api's **/
    async balance() {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.balance.retrieve();
        } catch (e) {
            sails.log.error(e.message);
        }
    },
    async testCharge(customerId) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.charges.create({ // transfer remaining amount to admin
                amount: 100 * 100, // amount should be in cents
                currency: sails.config.CURRENCY_CODE,
                customer: customerId
            });
        } catch (e) {
            console.log(e.message);
        }
    },
    async retrieveTransaction(transactionId) {
        try {
            let stripeObj = await StripeHandler.getStripeObject();

            return await stripeObj.balanceTransactions.retrieve(transactionId);
        } catch (e) {
            console.log(e.message);
        }
    },
    async chargeCustomerForRide(ride) {
        console.log('chargeCustomerForRide', ride.id);
        const user = await User.findOne({ id: ride.userId });
        user.email = UtilService.getPrimaryEmail(user.emails);
        let data = {
            paymentType: 'STRIPE',
            rideId: ride.id,
            rideCost: ride.totalFare,
            userId: user.id,
            userCards: user.cards,
            vehicleType: ride.vehicleType,
            rideNumber: ride.rideNumber,
            isRideDepositTransaction: ride.deductMinFare,
            rideType: ride.rideType
        };
        try {
            let stripeObj = await StripeHandler.getStripeObject();
            let chargeObj = await stripeObj.charges.create({
                amount: Math.round(ride.totalFare * 100),
                currency: sails.config.CURRENCY_CODE,
                customer: user.stripeCustomerId
            });
            console.log('chargeObj-------------------', ride.id);
            console.log(chargeObj);
            console.log('chargeObj-------------------', ride.id);
            if (chargeObj) {
                console.log('in chargeObj');
                const transactionObj = await this.retrieveTransaction(chargeObj.balance_transaction);
                let tax = 0;
                let taxData = _.find(transactionObj.fee_details, { type: 'tax' });
                if (taxData && taxData.amount) {
                    tax = taxData.amount / 100;
                }
                let transactionFees = {
                    totalFee: transactionObj.fee / 100,
                    stripeFee: _.find(transactionObj.fee_details, { type: 'stripe_fee' }).amount / 100,
                    tax: tax
                };
                let transactionCard = {
                    expMonth: chargeObj.source.exp_month,
                    expYear: chargeObj.source.exp_year,
                    last4: chargeObj.source.last4,
                    brand: chargeObj.source.brand,
                    id: chargeObj.source.id
                };
                let transactionAmount = chargeObj.amount / 100;
                let paymentTransactionId = chargeObj.id;
                data.transactionObj = transactionObj;
                data.tax = tax;
                data.transactionFees = transactionFees;
                data.transactionCard = transactionCard;
                data.transactionAmount = transactionAmount;
                data.paymentTransactionId = paymentTransactionId;

                data.chargeObj = chargeObj;
                data.transactionSuccess = true;

                /** Store transaction log for admin credit **/
                // await TransactionLog.create({
                //     chargeType: sails.config.TRANSACTION_LOG.STATUS.RIDE_COMPLETED,
                //     transactionBy: user.id,
                //     amount: (chargeObj.amount - transactionObj.fee) / 100,
                //     paymentTransactionId: chargeObj.id,
                //     status: sails.config.STRIPE.STATUS[chargeObj.status],
                //     rideId: ride.id,
                //     type: sails.config.STRIPE.TRANSACTION_TYPE.CREDIT,
                //     remark: sails.config.STRIPE.MESSAGE.RIDE_REQUEST_DONE_CHARGE,
                //     card: {
                //         expMonth: chargeObj.source.exp_month,
                //         expYear: chargeObj.source.exp_year,
                //         last4: chargeObj.source.last4,
                //         brand: chargeObj.source.brand,
                //         id: chargeObj.source.id
                //     }
                // });

            }
        } catch (e) {
            console.log('Payment error ******************', e);
            data.transactionSuccess = false;
            data.failedTransactionId = e.raw.charge;
            data.status = 'failed';
            data.errorData = e;
            data.errorData.errorMessage = sails.config.PAYMENT_ERRORS.STRIPE[e.raw.decline_code];
            if (!data.errorMessage || data.errorMessage == '') {
                data.errorMessage = 'Transaction was declined by payment gateway due to unknown reason';
            }
        }

        return data;
    }
};
