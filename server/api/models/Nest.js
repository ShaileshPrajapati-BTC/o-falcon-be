module.exports = {
    tableName: "Nest",
    attributes: {
        zoneId: {
            model: 'Zone',
            required: true
        },
        currentLocation: {
            type: 'json',
            columnType: 'object',
            description: {
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
            type: "string",
            required: true,
            unique: true,
        },
        isActive: {
            type: "boolean",
            defaultsTo: true,
        },
        type: {
            type: "number",
            required: true,
            description: sails.config.NEST_TYPE,
        },
        capacity: {
            type: "number",
            defaultsTo: 0,
        },
        totalVehicles: {
            type: "number",
            defaultsTo: 0,
        },
        dealerId: {
            model: 'user'
        },
        fleetType: {
            type: 'number'
        },
        totalRides: {
            type: "number",
            defaultsTo: 0,
        },
        // vehicleType: {
        //     type: 'number',
        //     defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE
        // }
        isNestCapacity: {
            type: "boolean",
            defaultsTo: true,
        },
        maxCapacity: {
            type: 'number',
            defaultsTo: 0
        },
        speedLimit: {
            type: 'number',
            defaultsTo: 0
        },
        isDeleted: {
            type: "boolean",
            defaultsTo: false,
        },
        isClaimed: {
            type: "boolean",
            defaultsTo: false,
        },
        isClaimedBy: {
            model: "User",
        },
        nestClaimTimeValue: {
            type: "number",
            // required: true,
        },
        nestClaimTimeType: {
            type: "number",
            defaultsTo: sails.config.NEST_CLAIM_TIME_TYPES.MINUTE,
            description: sails.config.NEST_CLAIM_TIME_TYPES
        },
        claimStartDateTime: { type: "string" },
        claimEndDateTime: { type: "string" },
        address: {
            type: 'string'
        },
        image: {
            type: 'string'
        },
        note: {
            type: 'string'
        }
    },
};
