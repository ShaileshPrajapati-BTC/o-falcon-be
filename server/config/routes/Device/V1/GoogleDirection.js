module.exports.routes = {
    'POST /api/v1/customer/google-direction': {
        controller: 'Device/V1/GoogleDirectionController',
        action: 'googleDirection',
        swagger: {
            summary: '',
            description: '',
            body: {
                origin: {
                    type: 'string',
                    required: true
                },
                destination: {
                    type: 'string',
                    required: true
                },
                mode: {
                    type: 'string',
                    required: true
                }
            }
        }
    }
};
