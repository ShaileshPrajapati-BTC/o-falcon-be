module.exports.routes = {
    'POST /admin/procedure/paginate': {
        controller: 'Admin/ProcedureController',
        action: 'paginate',
        swagger: {
            summary: 'List Procedure.',
            description: '',
            body: {}
        }
    },
    'POST /admin/procedure/add': {
        controller: 'Admin/ProcedureController',
        action: 'add',
        swagger: {
            summary: 'Add Procedure.',
            description: '',
            body: {
                name: {
                    type: 'string',
                    required: true
                },
                description: {
                    type: 'string',
                    required: false
                },
                path: {
                    type: 'string',
                    required: true
                },
                manufacturer: {
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
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            path: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    'PUT /admin/procedure/:id': {
        controller: 'Admin/ProcedureController',
        action: 'update',
        swagger: {
            summary: 'Add Procedure.',
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
    'GET /admin/procedure/:id': {
        controller: 'Admin/ProcedureController',
        action: 'view',
        swagger: {
            summary: 'Get procedure details.',
            description: '',
            body: {}
        }
    },
    'POST /admin/procedure/bulk-sequence-update': {
        controller: 'Admin/ProcedureController',
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
