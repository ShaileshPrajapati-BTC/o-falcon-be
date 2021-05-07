module.exports = {

    tableName: 'FirmewareUpdateLogs',
    schema: true,

    attributes: {

        vehicleId: {
            model: 'Vehicle',
        },
        track: {
            type: 'json'
        }
    }
};
