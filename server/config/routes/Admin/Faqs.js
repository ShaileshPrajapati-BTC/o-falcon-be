module.exports.routes = {
    'POST /admin/faqs/paginate': {
        controller: 'Admin/FaqsController',
        action: 'paginate',
        swagger: {
            summary: 'List Faqs.',
            description: '',
            body: {}
        }
    },
    'POST /admin/faqs/create': {
        controller: 'Admin/FaqsController',
        action: 'create',
        swagger: {
            summary: 'Add Faqs.',
            description: '',
            body: {
                question: {
                    type: 'string',
                    required: true,
                    unique: true
                },
                answer: {
                    type: 'string',
                    required: true
                },
                multiLanguageData: {
                    type: 'object',
                    items: {
                        language: 'object',
                        properties: {
                            question: { type: 'string' },
                            answer: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    'PUT /admin/faqs/:id': {
        controller: 'Admin/FaqsController',
        action: 'update',
        swagger: {
            summary: 'Add Faqs.',
            description: '',
            body: {
                question: {
                    type: 'string',
                    required: true,
                    unique: true
                },
                answer: {
                    type: 'string',
                    required: true
                },
                multiLanguageData: {
                    type: 'object',
                    items: {
                        language: 'object',
                        properties: {
                            question: { type: 'string' },
                            answer: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    'GET /admin/faqs/:id': {
        controller: 'Admin/FaqsController',
        action: 'view',
        swagger: {
            summary: 'Get Faqs details.',
            description: '',
            body: {}
        }
    },
    'POST /admin/faqs/bulk-sequence-update': {
        controller: 'Admin/FaqsController',
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
