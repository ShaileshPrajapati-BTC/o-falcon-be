module.exports = {
    tableName: 'RideBooking',
    schema: true,
    attributes: {
        rideNumber: {
            type: 'string',
            unique: true
        },
        iotRideId: {
            type: 'number',
            unique: true
        },
        userId: {
            model: 'User',
            required: true
        },
        franchiseeId: { model: 'user' },
        dealerId: { model: 'user' },
        vehicleId: {
            model: 'Vehicle',
            required: true
        },
        zoneId: {
            model: 'Zone',
            required: true
        },
        reservedDateTime: {
            type: 'string',
            columnType: 'datetime'
        },
        reservedEndDateTime: {
            type: 'string',
            columnType: 'datetime'
        },
        pauseEndDateTime: {
            type: 'string',
            columnType: 'datetime'
        },
        startDateTime: {
            type: 'string',
            columnType: 'datetime'
        },
        endDateTime: {
            type: 'string',
            columnType: 'datetime'
        },
        startLocation: {
            type: 'json',
            columnType: 'object',
            description: {
                name: { type: 'string' },
                type: {
                    type: 'string',
                    extendedDescription: ['Point'] // value must be "Point"
                },
                coordinates: { type: 'array' }
            }
        },
        endLocation: {
            type: 'json',
            columnType: 'object',
            description: {
                name: { type: 'string' },
                type: {
                    type: 'string',
                    extendedDescription: ['Point'] // value must be "Point"
                },
                coordinates: { type: 'array' }
            }
        },
        currentLocation: {
            type: 'json',
            columnType: 'object',
            description: {
                name: { type: 'string' },
                type: {
                    type: 'string',
                    extendedDescription: ['Point'] // value must be "Point"
                },
                coordinates: { type: 'array' }
            }
        },
        stopOverTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                sequence: {
                    type: 'number',
                    unique: true
                },
                stopLocation: {
                    type: 'json',
                    columnType: 'object',
                    description: {
                        name: { type: 'string' },
                        type: {
                            type: 'string',
                            extendedDescription: ['Point'] // value must be "Point"
                        },
                        coordinates: { type: 'array' }
                    }
                },
                startLocation: {
                    type: 'json',
                    columnType: 'object',
                    description: {
                        name: { type: 'string' },
                        type: {
                            type: 'string',
                            extendedDescription: ['Point'] // value must be "Point"
                        },
                        coordinates: { type: 'array' }
                    }
                },
                pauseTime: {
                    type: 'string',
                    columnType: 'datetime'
                },
                resumeTime: {
                    type: 'string',
                    columnType: 'datetime'
                },
                duration: { type: 'number' }
            }
        },
        status: {
            type: 'number',
            defaultsTo: sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
            extendedDescription: sails.config.RIDE_STATUS_ARRAY
        },
        statusTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                status: { type: 'integer' },
                dateTime: { type: 'datetime' },
                userId: { type: 'string' },
                remark: { type: 'string' }
            }
        },
        estimateEndLocation: {
            type: 'json',
            columnType: 'object',
            description: {
                name: { type: 'string' },
                type: {
                    type: 'string',
                    extendedDescription: ['Point'] // value must be "Point"
                },
                coordinates: { type: 'array' }
            }
        },
        estimateKm: { type: 'number' },
        estimateTime: { type: 'number' },
        estimateFare: { type: 'number' },
        totalKm: { type: 'number' },
        totalTime: { type: 'number' },
        totalFare: { type: 'number' },
        fareSummary: {
            type: 'json',
            columnType: 'object',
            description: {
                timeFareFreeLimit: { type: 'number' },
                distanceFareFreeLimit: { type: 'number' },
                reserved: { type: 'number' },
                paused: { type: 'number' },
                late: { type: 'number' },
                cancelled: { type: 'number' },
                distance: { type: 'number' },
                time: { type: 'number' },
                subTotal: { type: 'number' },
                reservedTime: { type: 'number' },
                pausedTime: { type: 'number' },
                lateTime: { type: 'number' },
                travelDistance: { type: 'number' },
                travelTime: { type: 'number' },
                tax: { type: 'number' },
                total: { type: 'number' },
                isBaseFareApplied: { type: 'boolean' }
            }
        },
        fareData: {
            type: 'json',
            columnType: 'object',
            description: {
                name: { type: 'string' },
                baseCurrency: { type: 'number' },
                isActive: { type: 'boolean' },
                isDefault: { type: 'boolean' },
                timeFare: { type: 'number' },
                distanceFare: { type: 'number' },
                ridePauseFare: { type: 'number' },
                rideReserveFare: { type: 'number' },
                lateFare: { type: 'number' },
                cancellationFare: { type: 'number' },
                timeFareFreeLimit: { type: 'number' },
                distanceFareFreeLimit: { type: 'number' },
                minimumFareType: { type: 'number' },
                baseFare: { type: 'number' },
                rideReserveTimeLimit: { type: 'number' },
                pauseTimeLimit: { type: 'number' },
                rideReserveTimeFreeLimit: { type: 'number' }
            }
        },
        isPaid: {
            type: 'boolean',
            defaultsTo: false
        },
        isPaused: {
            type: 'boolean',
            defaultsTo: false
        },
        pauseTime: {
            type: 'number',
            defaultsTo: 0 // time in seconds
        },
        isRequested: {
            type: 'boolean',
            defaultsTo: false
        },
        requestEndDateTime: {
            type: 'string',
            columnType: 'dateTime'
        },
        currentRequestTry: {
            type: 'number',
            defaultsTo: 0
        },
        maxRequestTry: {
            type: 'number',
            defaultsTo: sails.config.MAX_IOT_REQUEST_RETRY_LIMIT
        },
        locationTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                name: { type: 'string' },
                type: {
                    type: 'string',
                    extendedDescription: ['Point'] // value must be "Point"
                },
                coordinates: { type: 'array' }
            }
        },
        promoCodeId: {
            model: 'PromoCode',
        },
        promoCodeAmount: {
            type: 'number',
            defaultsTo: 0
        },
        isPromoCodeApplied: {
            type: 'boolean',
            defaultsTo: false
        },
        promoCodeText: {
            type: 'string'
        },
        scooterImage: {
            type: 'string'
        },
        isEndedByServer: {
            type: 'boolean',
            defaultsTo: false
        },
        vehicleType: {
            type: 'number',
            extendedDescription: sails.config.VEHICLE_TYPE,
            defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE
        },
        isRideDepositCharged: {
            type: 'boolean',
            defaultsTo: false
        },
        franchiseeCommission: {
            type: 'number',
            defaultsTo: 0.00
        },
        commissionPaymentStatus: {
            type: 'number',
            defaultsTo: 1
        },
        commissionRemainedToPay: {
            type: 'number',
            defaultsTo: 0.00
        },
        planInvoiceId: { model: 'PlanInvoice' },
        rideType: {
            type: 'number',
            defaultsTo: sails.config.RIDE_TYPE.DEFAULT,
            description: sails.config.RIDE_TYPE
        },
        planInvoiceTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                planInvoiceId: { type: 'string' },
                dateTime: { type: 'datetime' },
                userId: { type: 'string' },
                remark: { type: 'string' },
                remainingTimeLimit: { type: 'number' }
            }
        },
        startNest: {
            model: 'Nest'
        },
        endNest: {
            model: 'Nest'
        },
        tripType: {
            type: 'number',
            description: sails.config.TRIP_TYPE
        },
        currentNestId: {
            model: 'Nest'
        },
        currentNestType: {
            type: 'number',
            defaultsTo: 0,
            description: sails.config.NEST_TYPE
        },
        isRideEndFromAdmin: {
            type: 'boolean',
            defaultsTo: false
        },
        isPrivateRide: {
            type: 'boolean',
            defaultsTo: false
        },
        maxPauseLimitReached: {
            type: 'boolean',
            defaultsTo: false
        },
        ridePausedCount: {
            type: 'number',
            defaultsTo: 0
        },
        isFreeRide: {
            type: 'boolean',
            defaultsTo: false
        },
        maxRideTime: {
            type: 'string',
            columnType: 'datetime'
        },
        maxKm: {
            type: 'number',
            defaultsTo: 0
        },
        maxPauseEndDateTimeInSeconds: {
            type: 'number',
            defaultsTo: 0
        }
    }
};
