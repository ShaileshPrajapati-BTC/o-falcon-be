module.exports = {
    tableName: "NestTrack",
    attributes: {
        vehicleId: { model: 'Vehicle' },
        nestId: { model: 'Nest' },
        previousNestId: { model: 'Nest' },
        transferBy: { model: 'User' },
        transferDate: {
            type: 'string',
            columnType: 'datetime'
        },
        remark: { type: 'string' },
        rideId: { model: 'RideBooking' },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
    },
};
