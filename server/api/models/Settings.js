
module.exports = {
    tableName: 'Settings',
    schema: true,
    attributes: {
        basicRadius: { type: 'number' },
        minBatteryLevel: { type: 'number' },
        type: {
            type: 'number',
            unique: true,
            description: sails.config.SETTINGS.TYPES
        },
        notificationActions: {
            type: 'json',
            columnType: 'array',
            description: {
                action: { type: 'number' },
                sms: { type: 'boolean' },
                device: { type: 'boolean' },
                email: { type: 'boolean' },
                allowAdmin: { type: 'boolean' }
            }
        },

        rideReserveTimeLimit: { type: 'number' },
        pauseTimeLimit: { type: 'number' },
        rideReserveTimeFreeLimit: { type: 'number' },
        scooterUsedLimit: {
            type: 'json',
            columnType: 'object',
            description: {
                high: { type: 'number' },
                average: { type: 'number' },
                low: { type: 'number' }
            }
        },
        bookingHabitsRideLimit: {
            type: 'json',
            columnType: 'object',
            description: {
                high: { type: 'number' },
                average: { type: 'number' },
                low: { type: 'number' }
            }
        },
        unlockRadius: {
            type: 'number',
            defaultsTo: 0
        },
        commissionType: {
            type: 'number'
        },
        commissionAmount: {
            type: 'number'
        },
        commissionPercentage: {
            type: 'number'
        },
        commissionTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                data: { type: 'json' },
                type: { type: 'number' },
                percentage: { type: 'number' },
                amount: { type: 'number' },
                dateTime: { type: 'datetime' },
                userId: { model: 'user' },
                remark: { type: 'string' }
            }
        },
        franchiseeVehicleRentAmount: {
            type: 'number',
            defaultsTo: 0
        },
        dealerVehicleRentAmount: {
            type: 'number',
            defaultsTo: 0
        },
        taskSetting: {
            type: 'json',
            columnType: 'object',
            description: {
                incentiveRange: {
                    type: 'number'
                },
                timeLimitType: {
                    type: 'number'
                },
                timeLimitValue: {
                    type: 'number'
                },
                taskHeading: {
                    type: 'string'
                }
            }
        },
        minAgeRequired: {
            type: 'number',
            defaultsTo: 18
        },
        endWorkingTime: { type: 'string' },
        startWorkingTime: { type: 'string' },
        lightOnTime: { type: 'string' },
        lightOffTime: { type: 'string' },
        emailsForExportExcel: {
            type: 'json',
            columnType: 'array',
        },
    }
};
