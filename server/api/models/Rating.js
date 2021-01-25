module.exports = {
    tableName: 'Rating',
    schema: true,
    attributes: {
        // reference
        to: {
            model: 'Vehicle',
            required: true
        },
        rideId: {
            model: 'RideBooking',
            required: true
        },
        rating: {
            type: 'number',
            required: true
        },
        ratingType: {
            model: 'Master',
            required: true
        }
    }
};
