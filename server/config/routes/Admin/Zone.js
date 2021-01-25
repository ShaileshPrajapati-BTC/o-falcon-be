module.exports.routes = {
    'POST /admin/zone/add': {
        controller: 'Admin/ZoneController',
        action: 'add',
        swagger: {
            summary: 'Add Zone.',
            description: '',
            body: {
                userId: {
                    model: 'user',
                    required: true
                },
                boundary: {
                    type: 'json',
                    columnType: 'object',
                    items: {
                        name: { type: 'string' },
                        type: {
                            // value must be "Polygon"
                            type: 'string',
                            extendedDescription: ['Polygon']
                        },
                        coordinates: { type: 'array' }
                    }
                },
                name: {
                    type: 'string',
                    required: true
                },
                baseCurrency: {
                    type: 'number',
                    required: true
                },
                isActive: { type: 'boolean' },
                isDefault: { type: 'boolean' },
                timeFare: { type: 'number' },
                distanceFare: { type: 'number' },
                ridePauseFare: { type: 'number' },
                rideReserveFare: { type: 'number' },
                lateFare: { type: 'number' },
                cancellationFare: { type: 'number' },
                timeFareFreeLimit: { type: 'number' },
                distanceFareFreeLimit: { type: 'number' },
                fleetType: { type: 'array' }
            }
        }
    },
    'PUT /admin/zone/:id': {
        controller: 'Admin/ZoneController',
        action: 'update',
        swagger: {
            summary: 'Add Zone.',
            description: '',
            body: {
                userId: {
                    model: 'user',
                    required: true
                },
                boundary: {
                    type: 'json',
                    columnType: 'object',
                    items: {
                        name: { type: 'string' },
                        type: {
                            // value must be "Polygon"
                            type: 'string',
                            extendedDescription: ['Polygon']
                        },
                        coordinates: { type: 'array' }
                    }
                },
                name: {
                    type: 'string',
                    required: true
                },
                baseCurrency: {
                    type: 'number',
                    required: true
                },
                isActive: { type: 'boolean' },
                isDefault: { type: 'boolean' },
                timeFare: { type: 'number' },
                distanceFare: { type: 'number' },
                ridePauseFare: { type: 'number' },
                rideReserveFare: { type: 'number' },
                lateFare: { type: 'number' },
                cancellationFare: { type: 'number' },
                timeFareFreeLimit: { type: 'number' },
                distanceFareFreeLimit: { type: 'number' },
                fleetType: { type: 'array' }
            }
        }
    },
    'POST /admin/zone/paginate': {
        controller: 'Admin/ZoneController',
        action: 'paginate',
        swagger: {
            summary: 'List Zone.',
            description: '',
            body: {}
        }
    },
    'GET /admin/zone/:id': {
        controller: 'Admin/ZoneController',
        action: 'view',
        swagger: {
            summary: 'Get zone details.',
            description: '',
            body: {}
        }
    },
    'POST /admin/zone/zone-list': {
        controller: 'Admin/ZoneController',
        action: 'zoneList',
        swagger: {
            summary: 'List Zones Id, name and User Names',
            description: '',
            body: {}
        }
    },
    'DELETE /admin/zone/:id': 'Admin/ZoneController.delete',
};
