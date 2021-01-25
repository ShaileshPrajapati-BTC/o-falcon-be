module.exports.routes = {
    'POST /admin/vehicle/add': {
        controller: 'Admin/VehicleController',
        action: 'add',
        swagger: {
            summary: 'Add Vehicle.',
            description: '',
            body: {
                type: {
                    type: 'number',
                    required: true
                },
                number: {
                    type: 'string',
                    required: true,
                    unique: true
                },
                manufacturer: {
                    type: 'string',
                    required: true
                },
                name: {
                    type: 'string',
                    required: true
                },
                uniqVehicleId: {
                    type: 'string',
                    unique: true
                },
                imei: {
                    type: 'string',
                    unique: true
                },
                macAddress: {
                    type: 'string',
                    unique: true
                },
                lockManufacturer: { type: 'string' },
                multiLanguageData: {
                    type: 'object',
                    items: {
                        language: 'object',
                        properties: { name: { type: 'string' } }
                    }
                }
            }
        }
    },
    'POST /admin/vehicle/paginate': {
        controller: 'Admin/VehicleController',
        action: 'paginate',
        swagger: {
            summary: 'List Vehicle.',
            description: '',
            body: {}
        }
    },
    'PUT /admin/vehicle/:id': {
        controller: 'Admin/VehicleController',
        action: 'update',
        swagger: {
            summary: 'Add Vehicle.',
            description: '',
            body: {
                type: {
                    type: 'number'
                },
                number: {
                    type: 'string',
                    unique: true
                },
                manufacturer: {
                    type: 'string'
                },
                name: {
                    type: 'string'
                },
                uniqVehicleId: {
                    type: 'string',
                    unique: true
                },
                imei: {
                    type: 'string',
                    unique: true
                },
                macAddress: {
                    type: 'string',
                    unique: true
                },
                lockManufacturer: { type: 'string' },
                multiLanguageData: {
                    type: 'object',
                    items: {
                        language: 'object',
                        properties: { name: { type: 'string' } }
                    }
                }
            }
        }
    },
    'POST /admin/vehicle/get-chart-data': {
        controller: 'Admin/VehicleController',
        action: 'getChartData',
        swagger: {
            summary: 'data of chart.',
            description: '',
            body: {
                startDate: { type: 'string' },
                endDate: { type: 'string' }
            }
        }
    },
    'GET /admin/vehicle/:id': {
        controller: 'Admin/VehicleController',
        action: 'view',
        swagger: {
            summary: 'Get vehicle details.',
            description: '',
            body: {}
        }
    },
    'GET /admin/vehicle/detail/:id': {
        controller: 'Admin/VehicleController',
        action: 'detailView',
        swagger: {
            summary: 'Get vehicle details.',
            description: '',
            body: {}
        }
    },
    'GET /admin/vehicle/get-connection-status': {
        controller: 'Admin/VehicleController',
        action: 'getConnectionStatus',
        swagger: {
            summary: 'Connection status of Vehicle.',
            description: '',
            body: {}
        }
    },
    'GET /admin/vehicle/get-location-status': {
        controller: 'Admin/VehicleController',
        action: 'getLocationStatus',
        swagger: {
            summary: 'Location of Vehicles.',
            description: '',
            body: {}
        }
    },
    'GET /admin/vehicle/vehicle-demo-excel': {
        controller: 'Admin/VehicleController',
        action: 'demoVehicleExcel',
        swagger: {
            summary: 'Demo excel for vehicle.',
            description: '',
            body: {}
        }
    },

    'POST /admin/vehicle/import-vehicle-excel': {
        controller: 'Admin/VehicleController',
        action: 'importVehicle',
        swagger: {
            summary: 'Import vehicle excel file.',
            description: '',
            body: {}
        }
    },
    'POST /admin/vehicle/get-unassigned-vehicles': {
        controller: 'Admin/VehicleController',
        action: 'getUnassignedVehicle'
    },

    'GET /admin/vehicle/detail/iot-log-track/:id': {
        controller: 'Admin/VehicleController',
        action: 'vehicleDetailIotLogTrack',
        swagger: {
            summary: 'Get IOT Log track of vehicle.',
            description: '',
            body: {}
        }
    },

    'GET /admin/vehicle/detail/last-rides/:id': {
        controller: 'Admin/VehicleController',
        action: 'vehicleDetailLastRides',
        swagger: {
            summary: 'Get IOT Log track of vehicle.',
            description: '',
            body: {}
        }
    },
    'PUT /admin/vehicle/active-deactive': 'Admin/VehicleController.activeDeactive',
    'PUT /admin/vehicle/all-active-deactive': 'Admin/VehicleController.allActiveDeactive',
    'PUT /admin/vehicle/all-ride-stop': 'Admin/VehicleController.allRideStop'
};
