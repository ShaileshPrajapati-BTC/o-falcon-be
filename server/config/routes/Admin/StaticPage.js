module.exports.routes = {
    'POST /admin/static-page/add': {
        controller: 'Admin/StaticPageController',
        action: 'create',
        swagger: {
            summary: 'Add Static page.',
            description: '',
            body: {
                code: {
                    type: 'string',
                    required: true,
                    unique: true
                },
                description: {
                    type: 'string',
                    required: true
                },
                multiLanguageData: {
                    type: 'object',
                    items: {
                        language: 'object',
                        properties: { description: { type: 'string' } }
                    }
                }
            }
        }
    },
    'POST /admin/static-page/paginate': {
        controller: 'Admin/StaticPageController',
        action: 'paginate',
        swagger: {
            summary: 'List Static page.',
            description: '',
            body: {}
        }
    },
    'PUT /admin/static-page/:id': {
        controller: 'Admin/StaticPageController',
        action: 'update',
        swagger: {
            summary: 'Add Static page.',
            description: '',
            body: {
                code: {
                    type: 'string',
                    required: true,
                    unique: true
                },
                description: {
                    type: 'string',
                    required: true
                },
                multiLanguageData: {
                    type: 'object',
                    items: {
                        language: 'object',
                        properties: { description: { type: 'string' } }
                    }
                }
            }
        }
    },
    'GET /admin/static-page/:id': {
        controller: 'Admin/StaticPageController',
        action: 'view',
        swagger: {
            summary: 'Get static page details.',
            description: '',
            body: {}
        }
    },
    'POST /admin/static-page/get-page': {
        controller: 'Admin/StaticPageController',
        action: 'viewForFranchisee',
        swagger: {
            summary: 'Get static page details.',
            description: '',
            body: {
                code: {
                    type: 'string',
                    required: true,
                    unique: true
                }
            }
        }
    }
};
