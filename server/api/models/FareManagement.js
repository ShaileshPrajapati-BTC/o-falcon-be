module.exports = {
    tableName: 'FareManagement',
    attributes: {
        zoneId: {
            model: 'Zone',
            required: true
        },
        timeFare: {
            type: 'number',
            defaultsTo: 0
        },
        distanceFare: {
            type: 'number',
            defaultsTo: 0
        },
        ridePauseFare: {
            type: 'number',
            defaultsTo: 0
        },
        rideReserveFare: {
            type: 'number',
            defaultsTo: 0
        },
        cancellationFare: {
            type: 'number',
            defaultsTo: 0
        },
        timeFareFreeLimit: {
            type: 'number',
            defaultsTo: 0
        },
        distanceFareFreeLimit: {
            type: 'number',
            defaultsTo: 0
        },
        minimumFareType: {
            type: 'number',
            description: sails.config.MINIMUM_FARE_TYPE.CUSTOM
        },
        baseFare: {
            type: 'number',
            defaultsTo: 0
        },
        rideDeposit: {
            type: 'number',
            defaultsTo: 0
        },
        // distanceUnit: { type: 'number' },
        statusTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                data: { type: 'integer' },
                dateTime: { type: 'datetime' },
                userId: { type: 'string' },
                remark: { type: 'string' }
            }
        },
        parkingFine: {
            type: 'number',
            defaultsTo: 0
        },
        vehicleType: {
            type: 'number',
            defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE
        },
        unlockFees: {
            type: 'number',
            defaultsTo: 0
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        perXBaseMinute: {
            type: 'number',
            defaultsTo: 1
        }
    }
};
