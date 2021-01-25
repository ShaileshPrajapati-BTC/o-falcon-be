module.exports.routes = {

    'POST /admin/document/paginate': {
        controller: 'Admin/DocumentController',
        action: 'paginate',
        swagger: {
            summary: 'List document.',
            description: '',
            body: {}
        }
    },

    'POST /admin/document/add': {
        controller: 'Admin/DocumentController',
        action: 'add',
        swagger: {
            summary: 'Add Document.',
            description: '',
            body: {
                type: {
                    type: 'string',
                },
                name: {
                    type: 'string'
                },
                path: {
                    type: 'string'
                },
                backPath: {
                    type: 'string'
                },
                status: {
                    type: 'string'
                },
                number: {
                    type: 'string'
                },
                approvedDate: {
                    type: 'string'
                },
                expiryDate: {
                    type: 'string'
                },
                module: {
                    type: 'number'
                },
                referenceId: {
                    type: 'string'
                }               
            }
        }
    },

    'PUT /admin/document/:id': {
        controller: 'Admin/DocumentController',
        action: 'update',
        swagger: {
            summary: 'Add Document.',
            description: '',
            body: {
                type: {
                    type: 'string',
                },
                name: {
                    type: 'string'
                },
                path: {
                    type: 'string'
                },
                backPath: {
                    type: 'string'
                },
                status: {
                    type: 'string'
                },
                number: {
                    type: 'string'
                },
                approvedDate: {
                    type: 'string'
                },
                expiryDate: {
                    type: 'string'
                },
                module: {
                    type: 'number'
                },
                referenceId: {
                    type: 'string'
                } 
            }
        }
    },

    'GET /admin/document/:id': {
        controller: 'Admin/DocumentController',
        action: 'view',
        swagger: {
            summary: 'Get Document list.',
            description: '',
            body: {}
        }
    },

    'DELETE /admin/document/:id': {
        controller: 'Admin/DocumentController',
        action: 'delete',
        swagger: {
            summary: 'Delete document.',
            description: '',
            body: {}
        }
    },
}