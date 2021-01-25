module.exports = {
    tableName: "AssignRetainVehicleLog",
    schema: true,
    attributes: {
        vehicleId:{ model: 'vehicle' },
        assignerId:{ model: 'user' },
        referenceId:{ model: 'user' },
        operationType:{ type: 'number' },
        userType: { type: 'number' }
    }
};
