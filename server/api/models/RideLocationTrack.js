module.exports = {
    tableName: "RideLocationTrack",
    schema: true,
    attributes: {
        rideId: {
            model: 'RideBooking',
            required: true
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
    },
};
