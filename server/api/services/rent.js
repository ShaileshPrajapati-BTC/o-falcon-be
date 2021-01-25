const UtilService = require("./util");
const CommonService = require("./common");
const ObjectId = require("mongodb").ObjectID;

module.exports = {
    getUpdatedParams(loggedInUserType, params = {}) {
        if (sails.config.USER.ADMIN_USERS.includes(loggedInUserType)) {
            params.userType = sails.config.USER.TYPE.FRANCHISEE;
        } else if (loggedInUserType === sails.config.USER.TYPE.FRANCHISEE) {
            params.userType = sails.config.USER.TYPE.DEALER;
        }

        return params;
    },

    async addDefaultRent(referenceId, userId, userType) {
        if (!sails.config.RENT_SCOOTER_ACTIVE) {
            return;
        }
        const rentSetting = await Settings.findOne({
            type: sails.config.SETTINGS.TYPE.COMMISSION_SETTING,
        }).select(["franchiseeVehicleRentAmount", "dealerVehicleRentAmount"]);
        const vehicleRentAmount =
            userType === sails.config.USER.TYPE.FRANCHISEE
                ? rentSetting.franchiseeVehicleRentAmount
                : rentSetting.dealerVehicleRentAmount;
        const rentParams = {
            referenceId: referenceId,
            vehicleRentAmount: vehicleRentAmount,
            track: [
                {
                    data: [],
                    vehicleRentAmount: vehicleRentAmount,
                    dateTime: UtilService.getTimeFromNow(),
                    userId: userId,
                    remark: "default rent added!",
                },
            ],
            userType: userType,
            parentId: userId,
        };
        await Rent.create(rentParams);
    },

    async updateDefaultRentInSettings(data) {
        const criteria = {
            type: sails.config.SETTINGS.TYPE.COMMISSION_SETTING,
        };
        let updatedData = {};
        if (data.userType === sails.config.USER.TYPE.FRANCHISEE) {
            updatedData.franchiseeVehicleRentAmount = data.vehicleRentAmount;
        } else {
            updatedData.dealerVehicleRentAmount = data.vehicleRentAmount;
        }
        await Settings.update(criteria, updatedData);
    },

    async updateUserRent(data, userId) {
        const currentTime = await UtilService.getTimeFromNow();
        let remark = "rent updated!";
        if (data.remark) {
            remark = data.remark;
        }
        const lastRent = await Rent.findOne({
            referenceId: data.referenceId,
        });
        let trackObj = {
            vehicleRentAmount: data.vehicleRentAmount,
            dateTime: currentTime,
            userId: ObjectId(userId),
            remark: remark,
        };
        if (lastRent && lastRent.id) {
            trackObj.data = [
                {
                    before: lastRent.vehicleRentAmount,
                    key: "vehicleRentAmount",
                    remark: remark,
                    after: data.vehicleRentAmount,
                },
            ];
        }
        const criteria = {
            referenceId: ObjectId(data.referenceId),
        };
        const rentObj = {
            $set: {
                vehicleRentAmount: data.vehicleRentAmount,
                updatedAt: currentTime,
            },
            $push: {
                track: {
                    $each: [trackObj],
                },
            },
        };

        let updatedRent = await CommonService.runNativeQuery(
            criteria,
            rentObj,
            "rent"
        );
        // let updatedRent = await Rent.update(
        //     { referenceId: data.referenceId },
        //     {
        //         vehicleRentAmount: data.vehicleRentAmount,
        //     }
        // ).fetch();

        // if (updatedRent.length === 0) {
        //     throw sails.config.message.RECORD_NOT_FOUND;
        // }
        // updatedRent = updatedRent[0];
        return updatedRent;
    },
};
