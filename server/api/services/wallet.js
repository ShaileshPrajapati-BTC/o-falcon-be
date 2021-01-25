const UtilService = require(`./util`);

module.exports = {
    async getWalletConfig() {
        let walletConfig = {
            isWalletEnable: sails.config.IS_WALLET_ENABLE,
            minWalletCreditAmount: sails.config.MIN_WALLET_CREDIT_AMOUNT,
            maxWalletCreditAmount: sails.config.MAX_WALLET_CREDIT_AMOUNT,
            minWalletNotificationAmount:
                sails.config.MIN_WALLET_NOTIFICATION_AMOUNT,
            defaultWalletAmount: sails.config.DEFAULT_WALLET_AMOUNT,
            walletDenominations: sails.config.WALLET_DENOMINATIONS,
            minWalletAmountForRide: sails.config.MIN_WALLET_AMOUNT_FOR_RIDE,
            walletTopUps: sails.config.WALLET_TOP_UPS,
        };

        return walletConfig;
    },

    async chargeCustomerForRide(ride) {
        console.log("wallet chargeCustomerForRide", ride.id);
        const user = await User.findOne({ id: ride.userId });
        user.email = UtilService.getPrimaryEmail(user.emails);
        let data = {
            paymentType: "WALLET",
            rideId: ride.id,
            rideCost: ride.totalFare,
            userId: user.id,
            userCards: user.cards,
            vehicleType: ride.vehicleType,
            rideNumber: ride.rideNumber,
            isRideDepositTransaction: ride.deductMinFare,
            isWalletTransaction: true,
            planInvoiceId: ride.planInvoiceId,
            rideType: ride.rideType,
        };
        try {
            const walletAmount = user.walletAmount - ride.totalFare;
            await User.update({ id: user.id }, { walletAmount: walletAmount });
            data.transactionSuccess = true;
            data.transactionObj = null;
            data.tax = 0;
            data.transactionFees = { totalFee: ride.totalFare };
            data.transactionCard = null;
            data.transactionAmount = ride.totalFare;
            data.paymentTransactionId = "";
            data.chargeObj = { status: "paid" };
        } catch (e) {
            data.chargeObj = { status: "failed" };
            data.transactionSuccess = false;
            data.failedTransactionId = "";
            data.errorData = e;
            console.log("Payment error ******************", e);
        }

        return data;
    },

    async getWalletDataUsingRide(ride) {
        const walletConfig = await this.getWalletConfig();
        const isWalletEnable = walletConfig.isWalletEnable;
        const isWalletTransaction =
            typeof ride.isWalletTransaction === "boolean"
                ? ride.isWalletTransaction
                : false;
        const user = await User.findOne({ id: ride.userId });
        const userWalletAmount = user.walletAmount || 0;
        let isWalletCredit = false;
        if (ride.walletTransactionType) {
            isWalletCredit =
                ride.walletTransactionType ===
                sails.config.STRIPE.TRANSACTION_TYPE.CREDIT;
        }

        return {
            isWalletEnable,
            isWalletTransaction,
            isWalletCredit,
            userWalletAmount,
        };
    },

    async updateUserWallet(userId, walletAmount) {
        await User.update({ id: userId }, { walletAmount: walletAmount });
    },

    async increaseDecreaseWallet(userId, amount) {
        let currentWalletAmount = (await this.getUserWalletAmount(userId)) || 0;
        console.log(userId, "- 89 - before -> currentWalletAmount - ", currentWalletAmount)
        let updatedAmount = currentWalletAmount + amount;
        await this.updateUserWallet(userId, updatedAmount);
        currentWalletAmount = await this.getUserWalletAmount(userId);
        console.log(userId, '- 93 - after - currentWalletAmount - ', currentWalletAmount)
    },

    async addBonusAmountInTransactionObj(transactionObj, bonusAmount) {
        if (!transactionObj.id || bonusAmount === 0) {
            return transactionObj;
        }
        let updatedObj = await TransactionLog.update({ id: transactionObj.id }, {
            bonusAmount: bonusAmount
        }).fetch();
        updatedObj = updatedObj[0];
        updatedObj.paymentLink = transactionObj.paymentLink;

        return updatedObj;
    },

    async getUserWalletAmount(userId) {
        const user = await User.findOne({ id: userId }).select([
            "walletAmount",
        ]);

        return user.walletAmount;
    },

    async validateAddWalletAmount(amount) {
        const walletConfig = await this.getWalletConfig();
        if (!walletConfig.isWalletEnable) {
            throw sails.config.message.WALLET_NOT_ENABLED;
        }
        if (amount < walletConfig.minWalletCreditAmount) {
            throw sails.config.message.WALLET_CREDIT_MINIMUM_AMOUNT_FAILED;
        }
        if (amount > walletConfig.maxWalletCreditAmount) {
            throw sails.config.message.WALLET_CREDIT_MAXIMUM_AMOUNT_FAILED;
        }
    },

    async chargeCustomerForPlan(planInvoiceId, planPrice, userId) {
        console.log(
            "wallet chargeCustomerForPlan",
            userId,
            "planPrice",
            planPrice
        );
        const user = await User.findOne({ id: userId });
        let data = {
            paymentType: "WALLET",
            userId: user.id,
            isWalletTransaction: true,
            vehicleType: null,
            planInvoiceId: planInvoiceId,
            rideType: sails.config.RIDE_TYPE.SUBSCRIPTION,
        };
        try {
            const walletAmount = user.walletAmount - planPrice;
            await User.update({ id: user.id }, { walletAmount: walletAmount });
            data.transactionSuccess = true;
            data.transactionObj = null;
            data.tax = 0;
            data.transactionFees = { totalFee: planPrice };
            data.transactionCard = null;
            data.transactionAmount = planPrice;
            data.paymentTransactionId = "";
            data.chargeObj = { status: "paid" };
        } catch (e) {
            data.transactionSuccess = false;
            data.failedTransactionId = "";
            data.errorData = e;
            data.chargeObj = { status: "failed" };
            console.log("Payment error ******************", e);
        }

        return data;
    },

    async refundCustomerForPlan(planInvoiceId, planPrice, userId) {
        const data = {
            paymentType: "WALLET",
            rideNumber: null,
            isSystemTransaction: true,
            rideId: null,
            rideCost: planPrice,
            userId: userId,
            userCards: null,
            isWalletTransaction: true,
            transactionSuccess: true,
            transactionObj: null,
            tax: 0,
            transactionFees: { totalFee: planPrice },
            transactionCard: null,
            transactionAmount: planPrice,
            paymentTransactionId: "",
            chargeObj: { status: "refunded" },
            vehicleType: null,
            planInvoiceId: planInvoiceId,
            rideType: sails.config.RIDE_TYPE.SUBSCRIPTION,
        };
        try {
            const userWalletAmount =
                (await this.getUserWalletAmount(userId)) || 0;
            console.log(
                "refundCustomerForPlan -> userWalletAmount",
                userWalletAmount
            );
            let updatedUser = await User.update(
                { id: user.id },
                { walletAmount: userWalletAmount + planPrice }
            ).fetch();
            updatedUser = updatedUser[0];
            console.log("updatedUser walletAmount", updatedUser.walletAmount);
        } catch (e) {
            data.transactionSuccess = false;
            data.failedTransactionId = "";
            data.errorData = e;
            data.chargeObj = { status: "failed" };
            console.log("Payment error ******************", e);
        }

        return data;
    },

    async validateTopUps(topUps) {
        let objectIsNotCorrect = false;
        _.forEach(topUps, (obj) => {
            if (
                !(
                    "title" in obj &&
                    "amount" in obj &&
                    "bonusAmount" in obj &&
                    typeof obj.title === "string" &&
                    typeof obj.amount === "number" &&
                    typeof obj.bonusAmount === "number"
                )
            ) {
                objectIsNotCorrect = true;
                return false;
            }
        });
        if (objectIsNotCorrect) {
            throw sails.config.message.WALLET_TOP_UPS_INCORRECT;
        }
    },
};
