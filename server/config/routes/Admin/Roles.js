module.exports.routes = {
    /** ************** admin permission******************************************/
    'POST /admin/roles/paginate': {
        controller: 'Admin/RolesController',
        action: 'paginate',
        swagger: {
            summary: 'List roles',
            description: 'This is for listing roles',
            body: {
                page: { type: 'number', required: true },
                limit: { type: 'number', required: true },
                search: {
                    type: 'object',
                    properties: {
                        keys: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        keyword: { type: 'string' }
                    }
                }
            }
        }
    },
    'POST /admin/roles/upsert': {
        controller: 'Admin/RolesController',
        action: 'upsert',
        swagger: {
            summary: 'Create Role',
            description: 'This is for creating role',
            body: {
                title: { type: 'string', required: true },
                reason: { type: 'string' },
                isActive: { type: 'boolean' },
                permissions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            module: { type: 'number' },
                            permissions: {
                                type: 'object',
                                properties: {
                                    view: { type: 'boolean' },
                                    insert: { type: 'boolean' },
                                    update: { type: 'boolean' },
                                    delete: { type: 'boolean' },
                                    uploadExcel: { type: 'boolean' }
                                }
                            }
                        }
                    }
                }
            }

        }
    },
    'POST /admin/roles/user-permission': {
        controller: 'Admin/RolesController',
        action: 'getUserPermission',
        swagger: {
            summary: 'User Permission',
            description: 'This is for detailing of role',
            body: {}
        }
    },
    'GET /admin/roles/:id': {
        controller: 'Admin/RolesController',
        action: 'view',
        swagger: {
            summary: 'Detail Of role',
            description: 'This is for detailing of role',
            body: {}
        }
    },
    'GET /admin/roles/view-by-role/:role': 'Admin/RolesController.viewByRole'
};
