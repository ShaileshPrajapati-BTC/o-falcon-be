module.exports = {
    tableName: 'Procedure',
    schema: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        description: { type: 'string' },
        path: {
            type: 'string',
            required: true
        },
        manufacturer: {
            model: 'master',
            required: true
        },
        sequence: {
            type: 'number',
            required: true,
            unique: true
        },
        multiLanguageData: {
            type: 'json',
            columnType: 'object',
            description: { fieldType: 'object' }
            // name, description, path
        },
        // vehicleType: {
        //     type: 'number',
        //     extendedDescription: sails.config.VEHICLE_TYPE,
        //     defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE
        // }
    }
};
