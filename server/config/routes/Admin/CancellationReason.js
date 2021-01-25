module.exports.routes = {
    'POST /admin/cancellation-reasons/paginate': {
        controller: 'Admin/CancellationReasonController',
        action: 'paginate',
        swagger: {
            summary: 'List Cancellation Reason.',
            description: '',
            body: {}
        }
    },
    'POST /admin/cancellation-reasons/add': {
        controller: 'Admin/CancellationReasonController',
        action: 'add',
        swagger: {
            summary: 'Add Cancellation Reason.',
            description: '',
            body: {
                reason: {
                    type: 'string',
                    required: true
                },
                sequence: {
                    type: 'number',
                    required: true
                },
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
    'PUT /admin/cancellation-reasons/:id': {
        controller: 'Admin/CancellationReasonController',
        action: 'update',
        swagger: {
            summary: 'Add Cancellation Reason.',
            description: '',
            body: {
                reason: {
                    type: 'string',
                    required: true
                },
                sequence: {
                    type: 'number',
                    required: true
                },
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
    'GET /admin/cancellation-reasons/:id': {
        controller: 'Admin/CancellationReasonController',
        action: 'view',
        swagger: {
            summary: 'Get cancellation-reasons details.',
            description: '',
            body: {}
        }
    },
    'POST /admin/cancellation-reasons/bulk-sequence-update': {
        controller: 'Admin/CancellationReasonController',
        action: 'bulkSequenceUpdate',
        swagger: {
            summary: 'Update Help',
            description: 'This is for updating help sequence',
            body: {
                sequences: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            sequence: { type: 'number' }
                        }
                    }
                }
            }
        }
    }
};
