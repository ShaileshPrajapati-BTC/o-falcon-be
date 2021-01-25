module.exports = {
    tableName: 'VehicleSummary',
    schema: true,
    attributes: {
        vehicleId: {
            model: 'Vehicle',
            required: true,
            unique: true
        },
        rideSummary: {
            type: 'json',
            columnType: 'object',
            description: {
                reserved: { type: 'number' },
                paused: { type: 'number' },
                late: { type: 'number' },
                booked: { type: 'number' },
                cancelled: { type: 'number' },
                completed: { type: 'number' },
                reservedTime: { type: 'number' },
                pausedTime: { type: 'number' },
                lateTime: { type: 'number' },
                distance: { type: 'number' },
                time: { type: 'number' }
            }
        },
        fareSummary: {
            type: 'json',
            columnType: 'object',
            description: {
                reserved: { type: 'number' },
                paused: { type: 'number' },
                late: { type: 'number' },
                cancelled: { type: 'number' },
                distance: { type: 'number' },
                time: { type: 'number' },
                subTotal: { type: 'number' },
                tax: { type: 'number' },
                total: { type: 'number' }
            }
        },
        vehicleType: {
            type: 'number',
            extendedDescription: sails.config.VEHICLE_TYPE,
            defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE
        }
    }
};
