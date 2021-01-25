module.exports.routes = {
    'POST /api/v1/feeder/report/add': {
        controller: 'Device/V1/Feeder/ReportController',
        action: 'create',
        swagger: {
            summary: 'Generate new report.',
            description: '',
            body: {
                vehicleId: {
                    type: 'string',
                    required: true
                },
                categoryId: {
                    type: 'string',
                    required: true
                },
                comment: {
                    type: 'string'
                },
                images: {
                    type: 'array',
                    properties: { value: { type: 'string' } }
                },
                location: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        coordinates: {
                            type: 'array',
                            items: { type: 'number' }
                        }
                    }
                }
            }
        }
    },

    'POST /api/v1/feeder/report/verify-vehicle': {
        controller: 'Device/V1/Feeder/ReportController',
        action: 'captureVehicleToAddReport',
        swagger: {
            summary: 'Vehicle verification.',
            description: '',
            body: {
                qrNumber: {
                    type: 'string',
                    required: true
                },
            }
        }
    },

    'GET /api/v1/feeder/report/report-form/:categoryId': {
        controller: 'Device/V1/Feeder/ReportController',
        action: 'getReportForm',
        swagger: {
            summary: 'Get specific report form using category id.',
            description: '',
            body: {
                
            }
        }
    }
}