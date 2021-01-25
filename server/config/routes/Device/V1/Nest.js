module.exports.routes = {
    'POST /api/v1/customer/nest/list': {
        controller: 'Device/V1/NestController',
        action: 'nestList',
        swagger: {
            summary: 'Nest List.',
            description: 'Nest List.',
            body: {}
        }
    },

    'POST /api/v1/customer/nest/:id': {
        controller: 'Device/V1/NestController',
        action: 'view',
        swagger: {
            summary: '',
            description: '',
            body: {
            }
        }
    },
}
