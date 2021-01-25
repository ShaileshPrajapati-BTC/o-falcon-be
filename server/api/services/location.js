// const UtilService = require(`./util`);
// const CommonService = require('./common');
// const ObjectId = require('mongodb').ObjectID;

module.exports = {
    async bindLocations(franchiseeObj) {
        try {
            const {
                franchiseeCountryId,
                franchiseeStateId,
                franchiseeCityId
            } = franchiseeObj;
            let countryObj = franchiseeCountryId;
            let stateObj = franchiseeStateId;
            let citiesArray = franchiseeCityId;
            if (franchiseeCountryId) {
                countryObj = await Location.findOne({ id: franchiseeCountryId }).select(['id', 'name']);
            }
            if (franchiseeStateId) {
                stateObj = await Location.findOne({ id: franchiseeStateId }).select(['id', 'name']);
            }
            if (franchiseeCityId) {
                citiesArray = await Location.find({ id: franchiseeCityId }).select(['id', 'name']);
            }

            franchiseeObj.franchiseeCountryId = countryObj;
            franchiseeObj.franchiseeStateId = stateObj;
            franchiseeObj.franchiseeCityId = citiesArray;

            return franchiseeObj;
        } catch (e) {
            throw new Error(e);
        }
    },

    afterCreate: async function () {
    },
    afterUpdate: async function () {
    },
    afterDestroy: async function () {
    }
};
