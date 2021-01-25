const UtilService = require('./util');
const WalletService = require('./wallet');

module.exports = {
    async addFranchiseeRideSeries(seriesCode, franchiseeId) {
        let series = {
            type: sails.config.SERIES_GENERATOR.TYPE.RIDE_SERIES,
            prefix: sails.config.RIDE_SERIES_PREFIX,
            postfix: seriesCode,
            totalEntry: 0,
            digitLength: sails.config.FRANCHISEE_RIDE_DIGIT_LENGTH,
            franchiseeId: franchiseeId
        };
        await SeriesGenerator.create(series);
    },

    async createStaticPage(userId) {
        let TNC = {
            code: "TERMS_CONDITION",
            description: `<p><span style="color: rgb(84,84,84);font-size: 14px;font-family: Karla, sans-serif;">TERMS_CONDITION</span></p>`,
            multiLanguageData: {
                'en-US': {
                    description: `<p><span style="color: rgb(84,84,84);font-size: 14px;font-family: Karla, sans-serif;">TERMS_CONDITION</span></p>`
                }
            },
            userType: sails.config.USER.TYPE.DEALER,
            addedBy: userId
        }
        await StaticPage.create(TNC);
    },

    async createContactUs(userId) {
        let contactUs = {
            email: "test@escooter.com",
            cell: "1234567890",
            address: "test address",
            addedBy: userId
        }
        await ContactUsSetting.create(contactUs);
    },

    async creditRideFareToFranchiseeWallet(rideTotalFare, franchiseeId) {
        console.log(
            "creditRideFareToFranchiseeWallet -> rideTotalFare, franchiseeId",
            rideTotalFare,
            franchiseeId
        );
        if (rideTotalFare <= 0 || !franchiseeId) {
            return;
        }
        await WalletService.increaseDecreaseWallet(franchiseeId, rideTotalFare);
    },
};