const UtilService = require("./util");
const WalletService = require("./wallet");

module.exports = {
    async addDealerRideSeries(seriesCode, dealerId) {
        let series = {
            type: sails.config.SERIES_GENERATOR.TYPE.RIDE_SERIES,
            prefix: sails.config.RIDE_SERIES_PREFIX,
            postfix: seriesCode,
            totalEntry: 0,
            digitLength: sails.config.FRANCHISEE_RIDE_DIGIT_LENGTH,
            dealerId: dealerId,
        };
        await SeriesGenerator.create(series);
    },

    async creditRideFareToDealerWallet(rideTotalFare, dealerId) {
        console.log(
            "creditRideFareToDealerWallet -> rideTotalFare, dealerId",
            rideTotalFare,
            dealerId
        );
        if (rideTotalFare <= 0 || !dealerId) {
            return;
        }
        await WalletService.increaseDecreaseWallet(dealerId, rideTotalFare);
    },

    async createContactUs(userId) {
        let contactUs = {
            email: "test@escooter.com",
            cell: "1234567890",
            address: "test address",
            addedBy: userId
        }
        await ContactUsSetting.create(contactUs);
    }
};
