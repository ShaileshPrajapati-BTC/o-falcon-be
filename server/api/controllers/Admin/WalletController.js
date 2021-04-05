const UtilService = require(`${sails.config.appPath}/api/services/util`);
const UserService = require(`${sails.config.appPath}/api/services/user`);
module.exports = {
    async addBalance(req, res) {
        try {
            const fields = ['userId', 'amount'];;
            const params = req.allParams();
            let loginUser = req.user;
            commonValidator.checkRequiredParams(fields, params);
            if (params.amount <= 0) {
                throw sails.config.message.WALLET_CREDIT_MINIMUM_AMOUNT_FAILED;
            }
            let user = await User.findOne({ id: params.userId });
            if (!user || !user.id) {
                throw sails.config.message.USER_NOT_FOUND;
            }
            let walletAmount = UtilService.getFloat(user.walletAmount) + UtilService.getFloat(params.amount);
            await User.update({ id: params.userId }).set({ walletAmount: walletAmount });
            let transactionObj = {
                chargeType: sails.config.TRANSACTION_LOG.STATUS.WALLET_CREDIT,
                transactionBy: params.userId,
                amount: params.amount,
                status: sails.config.STRIPE.STATUS['succeeded'],
                type: sails.config.STRIPE.TRANSACTION_TYPE.CREDIT,
                addedBy: loginUser.id,
                isWalletTransaction : true
            };
            if (params.remark) {
                transactionObj.comment = params.remark;
            } 
            transactionObj.remark = sails.config.TRANSACTION_LOG.REMARK.ADD_WALLET_BY_ADMIN;
            await TransactionLog.create(transactionObj);
            await UserService.updateWalletExpriedTime(sails.config.WALLET_EXPIRED_TIME,user.id);


            return res.ok(transactionObj, sails.config.message.WALLET_CREDIT_REQUEST_CHARGE_SUCCESS);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
};