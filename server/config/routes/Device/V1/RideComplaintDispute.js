module.exports.routes = {
    'post /api/v1/customer/ride-complaint-dispute/create': {
        controller: 'Device/V1/RideComplaintDisputeController',
        action: 'create',
        swagger: {
            summary: 'Create a new ride complaint dispute',
            description: '',
            body: {
                userId: {
                    type: 'string',
                    required: true
                },
                rideId: { type: 'string' },
                actionQuestionnaireId: { type: 'string' },
                answer: { type: 'string' },
                attachments: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            path: { type: 'string' },
                            type: { type: 'integer' },
                            isPrimary: { type: 'boolean' }
                        }
                    }
                },
                status: { type: 'number' }
            }
        }
    },
    'post /api/v1/customer/ride-complaint-dispute/list': {
        controller: 'Device/V1/RideComplaintDisputeController',
        action: 'list',
        swagger: {
            summary: 'list ride complaint dispute',
            description: '',
            body: {
                type: { type: 'number' }
            }
        }
    },

    'post /api/v1/customer/ride-complaint-dispute/cancel': {
        controller: 'Device/V1/RideComplaintDisputeController',
        action: 'cancelComplaintDispute',
        swagger: {
            summary: 'cancel ride complaint dispute',
            description: '',
            body: {
                id: { type: 'string', required: true },
                remark: { type: 'string' }
            }
        }
    },
    'get /api/v1/customer/ride-complaint-dispute/:id': {
        controller: 'Device/V1/RideComplaintDisputeController',
        action: 'view'
    }
};
