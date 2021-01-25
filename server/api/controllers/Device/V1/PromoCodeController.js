const UtilService = require(`${sails.config.appPath}/api/services/util`);
const PromoCodeService = require(`${sails.config.appPath}/api/services/promoCode`);
const RideBookingService = require(`${sails.config.appPath}/api/services/rideBooking`);
const WalletService = require(`${sails.config.appPath}/api/services/wallet`);
const PaymentService = require(`${sails.config.appPath}/api/services/payment`);

module.exports = {
    applyPromoCode: async (req, res) => {
        try {
            const params = req.allParams();
            const loggedInUser = req.user;
            const promoCode = params.promoCode.toString().toUpperCase();

            let franchiseeId = loggedInUser.franchiseeId ? loggedInUser.franchiseeId : null;
            let dealerId = loggedInUser.dealerId ? loggedInUser.dealerId : null;

            let promoCodeAddedBy = null;

            if (franchiseeId) {
                promoCodeAddedBy = franchiseeId;
            } else if (dealerId) {
                promoCodeAddedBy = dealerId;
            }

            let promoCodeRecord = await PromoCode.findOne({
                code: promoCode,
                addedBy: promoCodeAddedBy
            });
            if (!promoCodeRecord || !promoCodeRecord.id) {
                throw sails.config.message.PROMO_CODE_NOT_FOUND;
            }
            const fields = ['promoCode'];
            if (promoCodeRecord.type !== sails.config.PROMO_CODE_TYPE.WALLET_BALANCE) {
                fields.push('rideId')
            }
            if (promoCodeRecord.type !== sails.config.PROMO_CODE_TYPE.WALLET_BALANCE && !params.rideId) {
                throw sails.config.message.RIDE_PROMO_CODE_ONLY;
            }
            commonValidator.checkRequiredParams(fields, params);
            let hasAccess = promoCodeRecord.isApplicableToAllUsers ||
                promoCodeRecord.applicableUsers.includes(loggedInUser.id);
            if (!hasAccess) {
                throw sails.config.message.PROMO_CODE_NOT_FOUND;
            }
            let currentTime = UtilService.getTimeFromNow();
            if (
                !promoCodeRecord.isActive ||
                promoCodeRecord.endDateTime <= currentTime
            ) {
                throw sails.config.message.PROMO_CODE_EXPIRED;
            }
            if (promoCodeRecord.type === sails.config.PROMO_CODE_TYPE.WALLET_BALANCE) {
                if (params.rideId) {
                    throw sails.config.message.NO_WALLET_PROMO_CODE_ON_RIDE;
                }
                await PromoCodeService.checkWalletPromoCodeMaxUsed(loggedInUser.id, promoCodeRecord);

                let updatedAmount = loggedInUser.walletAmount + promoCodeRecord.flatDiscountAmount;
                await WalletService.updateUserWallet(loggedInUser.id, updatedAmount);
                await PaymentService.walletPromoCodeTransactionLog(loggedInUser.id, promoCodeRecord.flatDiscountAmount, promoCodeRecord);

                return res.ok(
                    {
                        user: { walletAmount: updatedAmount },
                        amount: promoCodeRecord.flatDiscountAmount
                    },
                    sails.config.message.PROMO_CODE_APPLIED
                );
            }
            const ride = await RideBooking.findOne({
                id: params.rideId,
                userId: loggedInUser.id
            });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }
            if (ride.isPaid) {
                throw sails.config.message.RIDE_ALREADY_PAID;
            }
            if (!promoCodeRecord.vehicleType.includes(ride.vehicleType)) {
                if (ride.vehicleType === sails.config.VEHICLE_TYPE.BICYCLE) {
                    throw sails.config.message.PROMO_CODE_NOT_FOR_BICYCLE;
                } else if (ride.vehicleType === sails.config.VEHICLE_TYPE.SCOOTER) {
                    throw sails.config.message.PROMO_CODE_NOT_FOR_SCOOTER;
                } else if (ride.vehicleType === sails.config.VEHICLE_TYPE.BIKE) {
                    throw sails.config.message.PROMO_CODE_NOT_FOR_BIKE;
                }
            }
            const {
                id,
                type,
                maxUseLimitPerUser
            } = promoCodeRecord;
            const isFirstRide =
                type === sails.config.PROMO_CODE_TYPE.FIRST_RIDE;
            if (isFirstRide) {
                const firstRideCountFilter = {
                    userId: loggedInUser.id,
                    status: sails.config.RIDE_STATUS.COMPLETED
                };
                const firstRideCount = await RideBooking.count(firstRideCountFilter);
                if (firstRideCount > 0) {
                    throw sails.config.message.PROMO_CODE_ONLY_FOR_FIRST_RIDE;
                }
            } else {
                const countFilter = {
                    userId: loggedInUser.id,
                    promoCodeId: id
                };
                const promoCodeAppliedCount = await RideBooking.count(countFilter);
                if (promoCodeAppliedCount >= maxUseLimitPerUser) {
                    throw sails.config.message.PROMO_CODE_LIMIT_REACHED;
                }
            }

            let updateObj = {
                promoCodeId: id,
                promoCodeText: promoCodeRecord.code,
                isPromoCodeApplied: true,
                updatedBy: loggedInUser.id
            };
            if (!sails.config.IS_AUTO_DEDUCT) {
                let resultObj = await PromoCodeService.addPromoCodeAmount(ride.fareSummary, promoCodeRecord.id);
                updateObj.fareSummary = resultObj.fareSummary;
                updateObj.totalFare = resultObj.totalFare;
                updateObj.promoCodeAmount = resultObj.promoCodeAmount;
            }
            await RideBooking.update({ id: ride.id }, updateObj);
            let rideData = await RideBookingService.getRideResponse(ride.id);
            if (rideData && rideData.isPromoCodeApplied) {
                return res.ok(
                    rideData,
                    sails.config.message.PROMO_CODE_APPLIED
                );
            }

            return res.ok({}, sails.config.message.PROMO_CODE_NOT_APPLIED);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    },

    async list(req, res) {
        try {
            const loggedInUser = req.user;
            let franchiseeId = loggedInUser.franchiseeId ? loggedInUser.franchiseeId : null;
            let dealerId = loggedInUser.dealerId ? loggedInUser.dealerId : null;

            let promoCodeAddedBy = null;

            if (franchiseeId) {
                promoCodeAddedBy = franchiseeId;
            } else if (dealerId) {
                promoCodeAddedBy = dealerId;
            }
            let filter = {
                or: [
                    { isApplicableToAllUsers: true },
                    { applicableUsers: loggedInUser.id }
                ],
                isActive: true,
                addedBy: promoCodeAddedBy,
                endDateTime: {
                    '>=': UtilService.getStartOfTheDay()
                }
            };
            let recordsList = await PromoCode.find(filter);
            if (!recordsList.length) {
                return res.ok({}, sails.config.message.LIST_NOT_FOUND);
            }
            let response = {
                list: recordsList,
                count: recordsList.length
            };

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async remove(req, res) {
        try {
            const fields = ['rideId'];
            const params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            const loggedInUser = req.user;
            const ride = await RideBooking.findOne({
                id: params.rideId,
                userId: loggedInUser.id
            });
            if (!ride || !ride.id) {
                throw sails.config.message.RIDE_NOT_FOUND;
            }
            if (!ride.promoCodeId) {
                throw sails.config.message.PROMO_CODE_NOT_APPLIED_BEFORE;
            }
            if (ride.isPaid) {
                throw sails.config.message.RIDE_ALREADY_PAID;
            }

            let updateObj = {
                promoCodeId: null,
                isPromoCodeApplied: false,
                promoCodeText: '',
                updatedBy: loggedInUser.id
            };
            if (!sails.config.IS_AUTO_DEDUCT) {
                const newAmount = ride.totalFare + ride.promoCodeAmount;
                let newFareSummary = ride.fareSummary;
                newFareSummary.promoCodeAmount = 0;
                newFareSummary.total = newAmount;
                updateObj.fareSummary = ride.newFareSummary;
                updateObj.totalFare = newAmount;
                updateObj.promoCodeAmount = 0;
            }
            await RideBooking.update({ id: ride.id }, updateObj);
            let rideData = await RideBookingService.getRideResponse(ride.id);

            if (rideData && !rideData.isPromoCodeApplied) {
                return res.ok(
                    rideData,
                    sails.config.message.PROMO_CODE_REMOVED
                );
            }

            return res.ok({}, sails.config.message.PROMO_CODE_REMOVE_FAILED);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    }
};
