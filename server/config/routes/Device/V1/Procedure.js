module.exports.routes = {
    'GET /api/v1/customer/procedure/list': {
        controller: 'Device/V1/ProcedureController',
        action: 'list',
        swagger: {
            summary: 'list of procedures.',
            description: '',
            body: {}
        }
    }
};
