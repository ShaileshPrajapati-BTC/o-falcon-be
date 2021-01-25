module.exports = {
    tableName: 'Zone',
    attributes: {
        boundary: {
            type: 'json',
            columnType: 'object',
            description: {
                name: { type: 'string' },
                type: {
                    // value must be "Polygon"
                    type: 'string',
                    extendedDescription: ['Polygon', 'Point']
                },
                coordinates: { type: 'array' },
                radius: { type: "number" },
                shapeType: { type: 'string' }
            }
        },
        bounds: {
            type: 'json',
            columnType: 'object',
            description: {
                north: { type: "number" },
                south: { type: "number" },
                west: { type: "number" },
                east: { type: "number" }
            }
        },
        center: {
            type: 'json',
            columnType: 'object',
            description: {
                lat: { type: "number" },
                lng: { type: "number" }
            }
        },
        name: {
            type: 'string',
            required: true
        },
        baseCurrency: {
            type: 'number',
            defaultsTo: sails.config.CURRENCY_TYPES.USD,
            extendedDescription: sails.config.CURRENCY_TYPES_ARRAY
        },
        vehicleTypes: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
            description: { fieldType: 'number' }
        },
        isActive: {
            type: 'boolean',
            defaultsTo: true
        },
        isAutoCreated: {
            type: 'boolean',
            defaultsTo: false
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        franchiseeId: { model: 'User' },
        dealerId: { model: 'User' },
        fleetType: {
            type:  'number',
            description: sails.config.USER.FLEET_TYPE
        },
    }
};
