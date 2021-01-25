const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const ObjectId = require('mongodb').ObjectID;
const WalletService = require(`${sails.config.appPath}/api/services/wallet`);
const StripeService = require(`${sails.config.appPath}/api/services/Payment/Stripe/payment`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);

module.exports = {
    async addCardToCustomer(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        if (!params) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        let DEFAULT_PAYMENT_METHOD = sails.config.DEFAULT_PAYMENT_METHOD;
        if (!loggedInUser.stripeCustomerId && (DEFAULT_PAYMENT_METHOD === sails.config.PAYMENT_GATEWAYS.STRIPE)) {
            let primaryEmail = UtilService.getPrimaryEmail(loggedInUser.emails);
            let primaryMobile = UtilService.getPrimaryValue(loggedInUser.mobiles, 'mobile');
            await StripeService.createCustomer(loggedInUser.id, primaryEmail, primaryMobile);
            loggedInUser = await User.findOne({ id: loggedInUser.id });
        }
        try {
            /** add card as a source for payment in stripe **/
            let card = await PaymentService.addCardToCustomer(loggedInUser, params);

            if (card) {
                let cardObj = {
                    expMonth: card.exp_month,
                    expYear: card.exp_year,
                    last4: card.last4,
                    first4: card.first4,
                    brand: card.brand,
                    id: card.id
                };
                for (let cardKey in card) {
                    cardObj[cardKey] = card[cardKey];
                }
                if (card['tid'] || card['payAuthCode']) {
                    cardObj['exp_month'] = card['expMonth'];
                    cardObj['exp_year'] = card['expYear'];
                    delete card['updatedBy'];
                }
                if (!loggedInUser.cards || _.size(loggedInUser.cards) === 0) {
                    cardObj.isPrimary = true;
                    loggedInUser.cards = [];
                }

                loggedInUser.cards.push(cardObj);

                /** update user with card object **/
                await User.update({ id: loggedInUser.id }, { cards: loggedInUser.cards });

                /** Charge card to verify it **/
                // await PaymentService.chargeCardVerifyAmount(loggedInUser.stripeCustomerId, card.id, sails.config.STRIPE_CARD_VERIFY_AMOUNT);

                return res.ok(cardObj, sails.config.message.STRIPE_CUSTOMER_CARD_SUCCESS);
            }

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        } catch (e) {
            console.log('e.message', e);

            return res.serverError({}, {
                code: 'UNPROCESSABLE_ENTITY',
                message: e.message,
                status: 401
            });
        }
    },

    async updateCard(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        if (!params || !params.cardDetails) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let card = await PaymentService.updateCustomerCard(loggedInUser.stripeCustomerId, params.cardDetails);
            if (card) {
                await new Promise((resolve, reject) => {
                    let db = User.getDatastore().manager;
                    let collection = db.collection(User.tableName);
                    collection.update({ _id: ObjectId(loggedInUser.id), 'cards.id': cardId }, {
                        $set: {
                            'cards.$.expMonth': card.exp_month,
                            'cards.$.expYear': card.exp_year,
                            'cards.$.last4': card.last4,
                            'cards.$.brand': card.brand
                        }
                    }, (err, res) => {
                        if (err) {
                            return res.serverError(err, sails.config.message.SERVER_ERROR)
                        }
                        resolve()

                    });
                });

                return res.ok({}, sails.config.message.STRIPE_CUSTOMER_CARD_UPDATED);
            }

            return res.serverError(null, sails.config.message.SERVER_ERROR);

        } catch (e) {
            return res.serverError({}, {
                code: 'E_SERVER_ERROR',
                message: e.message,
                status: 401
            });
        }
    },
    async removeCard(req, res) {
        let params = req.allParams();
        let loggedInUser = req.user;
        if (!params || !params.cardId) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        try {
            let isPrimary = _.find(loggedInUser.cards, (card) => {
                return card.isPrimary && card.id === params.cardId;
            });
            if (isPrimary) {
                return res.badRequest(null, sails.config.message.CARD_PRIMARY_NOT_REMOVED);
            }
            /** remove card as a source for payment in stripe **/
            await PaymentService.removedCardFromCustomer(loggedInUser, params);
            // update record
            await new Promise((resolve, reject) => {
                let db = User.getDatastore().manager;
                let collection = db.collection(User.tableName);
                collection.update({ _id: ObjectId(loggedInUser.id) }, { $pull: { cards: { id: params.cardId } } }, (err, res) => {
                    if (err) {
                        return res.serverError(err, sails.config.message.SERVER_ERROR);
                    }
                    resolve();

                });
            });

            return res.ok({}, sails.config.message.STRIPE_CUSTOMER_CARD_REMOVED);
        } catch (e) {
            console.log(e);

            return res.serverError({}, {
                code: 'E_SERVER_ERROR',
                message: e.message,
                status: 401
            });
        }
    },
    async setDefaultCustomerCard(req, res) {
        let params = req.allParams();
        if (!params || !params.cardId) {
            return res.badRequest(null, sails.config.message.BAD_REQUEST);
        }
        let loggedInUser = req.user;
        try {
            let cardObj = await PaymentService.setDefaultCustomerCard(loggedInUser, params);
            if (cardObj) {
                let newDetails = [];
                _.each(loggedInUser.cards, (card) => {
                    card.isPrimary = card.id === params.cardId;
                    newDetails.push(card);
                });
                await User.update({ id: loggedInUser.id }, { cards: newDetails });

                return res.ok({}, sails.config.message.STRIPE_CUSTOMER_CARD_PRIMARY);
            }

            return res.serverError(null, sails.config.message.SERVER_ERROR);

        } catch (e) {
            return res.serverError({}, {
                code: 'E_SERVER_ERROR',
                message: e.message,
                status: 401
            });
        }
    },
};
