let CommonService = require(sails.config.appPath + "/api/services/common");
let UserService = require(sails.config.appPath + '/api/services/user');
const RideBookingService = require(`${sails.config.appPath}/api/services/rideBooking`);
const BookingPassService = require(`${sails.config.appPath}/api/services/bookingPass`);
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);
const UtilService = require(`${sails.config.appPath}/api/services/util`);

module.exports = {
    async list(req, res) {
        try {
            let params = req.allParams();
            if (!params || !params.type) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            let query = [
                {
                    $unwind: "$vehicleTypes",
                },
                {
                    $match: {
                        "vehicleTypes.vehicleType": params.type,
                        isActive: true
                    }
                },
                {
                    $addFields: { id: "$_id" }
                },
                {
                    $project: { _id: 0 }
                },
                {
                    $group: {
                        _id: "$vehicleTypes.vehicleType",
                        list: { $push: "$$ROOT" },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                // {
                //     $project: {
                //         list: "$list.list",
                //         count: "$list.count",
                //         "list._id": 0
                //     }
                // },
            ];
            let recordsList = await CommonService.runAggregateQuery(
                query,
                "BookingPass"
            );
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }

            // // count
            // query.push({
            //     $count: "bookingPassCount",
            // });
            // let countResult = await CommonService.runAggregateQuery(
            //     query,
            //     "BookingPass"
            // );
            // response.count =
            //     countResult && countResult[0]
            //         ? countResult[0].bookingPassCount
            //         : 0;

            let user = await User.findOne({ id: req.user.id });
            let currentPlans;
            if (user.currentBookingPassIds) {
                currentPlans = await PlanInvoice.find({ id: user.currentBookingPassIds });
                for (let i = 0; i < currentPlans.length; i++) {
                    const vehicleType = currentPlans[i].vehicleType;
                    const currentVehicleTypeData = currentPlans[i].planData &&
                        currentPlans[i].planData.vehicleTypes &&
                        currentPlans[i].planData.vehicleTypes.filter((e) => e.vehicleType === vehicleType);
                    if (currentVehicleTypeData && currentVehicleTypeData[0]) {
                        currentPlans[i].planData.vehicleTypes = currentVehicleTypeData[0];
                    }
                    currentPlans[i].remainingTimeLimit = currentPlans[i].remainingTimeLimit / 60;
                }
            }

            let list = recordsList[0] ? recordsList[0].list : [];
            let count = recordsList[0] ? recordsList[0].count : 0;
            let currentBookingPassIds = currentPlans;
            return res.ok({ list, count, currentBookingPassIds }, sails.config.message.OK);
        } catch (err) {
            console.log(err);

            return res.serverError(null, sails.config.message.SERVER_ERROR);
        }
    },

    async purchasePass(req, res) {
        try {
            const fields = ["planId"];
            let params = req.allParams();
            if (!params.vehicleType) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }
            const vehicleType = params.vehicleType;
            delete params.vehicleType;
            commonValidator.checkRequiredParams(fields, params);
            const loggedInUser = req.user;
            const userId = loggedInUser.id;

            let isTimeClose = await operationalHours.checkIsOperationalHoursCLose();
            if(isTimeClose.isTimeClose){
                throw sails.config.message.BOOKING_PASS_OPERATIONAL_HOURS_CLOSE;   
            }

            const plan = await BookingPass.findOne({
                id: params.planId,
            });
            if (!plan || !plan.id) {
                throw sails.config.message.BOOKING_PASS_NOT_FOUND;
            }

            BookingPassService.checkAvailblePassForVehicleType(plan, vehicleType)
            const activeRide = await RideBookingService.getActiveRide(userId);
            if (activeRide) {
                throw sails.config.message.CANT_BUY_PLAN;
            }
            if (!plan.isActive) {
                throw sails.config.message.PLAN_NOT_ACTIVE;
            }

            await BookingPassService.checkUsedPassForVehicleType(userId, vehicleType)

            const planPriceDetails = await BookingPassService.getPlanPriceDetails(plan, vehicleType)
            if (!("walletAmount" in loggedInUser) || loggedInUser.walletAmount < planPriceDetails.price) {
                throw sails.config.message.NOT_ENOUGH_AMOUNT_IN_WALLET;
            }

            let planTotalTimeLimit = BookingPassService.countTimeLimitInSeconds(
                plan.limitValue,
                plan.limitType
            );

            const expirationStartDateTime = UtilService.getTimeFromNow();
            const expirationEndDateTime = await BookingPassService.addTime(
                plan.expirationType,
                plan.expirationValue
            );

            const createParams = {
                userId: userId,
                planId: plan.id,
                passId: plan.id,
                totalTimeLimit: planTotalTimeLimit,
                remainingTimeLimit: planTotalTimeLimit,
                planData: plan,
                planPrice: planPriceDetails.price,
                planName: plan.name,
                vehicleType: vehicleType,
                isTrialPlan: false,
                isRenewable: false,
                limitType: plan.expirationType,
                limitValue: plan.expirationValue,
                expirationStartDateTime: expirationStartDateTime,
                expirationEndDateTime: expirationEndDateTime
            };


            let planInvoice = await PlanInvoice.create(createParams).fetch();

            if (!planInvoice || !planInvoice.id) {
                throw sails.config.message.BUY_PLAN_FAILED;
            }

            let chargeObj = await PaymentService.chargeCustomerForPlanUsingWallet(
                planInvoice.id,
                planPriceDetails.price,
                userId
            );

            if (chargeObj.flag) {
                const user = await User.findOne({ id: userId });
                let currentBookingPass = user.currentBookingPassIds ? user.currentBookingPassIds : []
                currentBookingPass.push(planInvoice.id)
                await User.update(
                    { id: userId },
                    { currentBookingPassIds: currentBookingPass }
                );

                const latestUserObj = await UserService.getLatestUserWithCurrentPass(loggedInUser.id);

                return res.ok(
                    {
                        paymentData: chargeObj.data,
                        loggedInUser: latestUserObj,
                    },
                    sails.config.message.BUY_PLAN_REQUEST_CHARGE_SUCCESS
                );
            }
            let errMsgObj = JSON.parse(
                JSON.stringify(
                    sails.config.message.BUY_PLAN_REQUEST_CHARGE_FAILED
                )
            );
            if (
                chargeObj &&
                chargeObj.data &&
                chargeObj.data.raw &&
                chargeObj.data.raw.message
            ) {
                errMsgObj.message += ` due to ${chargeObj.data.raw.message}`;
            } else if (chargeObj && chargeObj.data && chargeObj.data.message) {
                errMsgObj.message += ` due to ${chargeObj.data.message}`;
            }
            latestUserObj = await UserService.getLatestUserWithCurrentPass(loggedInUser.id);

            return res.ok(
                { paymentData: chargeObj.data, loggedInUser: latestUserObj },
                errMsgObj
            );
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },
};
