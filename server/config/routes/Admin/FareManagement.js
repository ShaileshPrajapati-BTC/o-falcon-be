module.exports.routes = {
    'POST /admin/fare-management/add': {
        controller: 'Admin/ZoneController',
        action: 'add',
        swagger: {
            summary: 'Add FareManagement.',
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
                distanceFareFreeLimit: { type: 'number' }
            }
        }
    },
    'PUT /admin/fare-management/:id': {
        controller: 'Admin/FareManagementController',
        action: 'update',
        swagger: {
            summary: 'Add FareManagement.',
            description: '',
            body: {
                userId: {
                    model: 'user',
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
                parkingCaptureImage: { type: 'boolean' }
            }
        }
    },
    'POST /admin/fare-management/paginate': {
        controller: 'Admin/FareManagementController',
        action: 'paginate',
        swagger: {
            summary: 'List FareManagement.',
            description: '',
            body: {}
        }
    },
    'GET /admin/fare-management/:id': {
        controller: 'Admin/FareManagementController',
        action: 'view',
        swagger: {
            summary: 'Get fare-management details.',
            description: '',
            body: {}
        }
    },
    'GET /admin/fare-management/zone-list': {
        controller: 'Admin/ZoneController',
        action: 'zoneList',
        swagger: {
            summary: 'List Zones Id, name and User Names',
            description: '',
            body: {}
        }
    },
    'DELETE /admin/fare-management/:id': 'Admin/ZoneController.delete',
};
