const sails = require('sails');
const config = require(sails.config.appPath + '/config/constant/basicModuleSetting');
module.exports.routes = {
    /*Master*/
    'POST /admin/master/create': {
        controller: 'Admin/MasterController',
        action: 'create',
        module: config.modules.master,
        operation: config.permission.insert,
        swagger: {
            summary: 'Create Master',
            description: 'This is for creating master',
            body: {
                name: { type: 'string' },
                code: { type: 'string' },
                group: { type: 'string' },
                description: { type: 'string' },
                isActive: { type: 'boolean' },
                isDefault: { type: 'boolean' },
                sequence: { type: 'number' },
                icon: { type: 'string' },
                image: { type: 'string' },
                parentId: { type: 'string' }
            }
        }
    },
    'POST /admin/master/paginate': {
        controller: 'Admin/MasterController',
        action: 'paginate',
        module: config.modules.master,
        operation: config.permission.list,
        swagger: {
            summary: 'List Master',
            description: 'This is for listing master',
            body: {
                page: {
                    type: 'number',
                    required: true
                },
                limit: {
                    type: 'number',
                    required: true
                },
                search: {
                    type: 'object',
                    'properties': {
                        'keys': {
                            'type': 'array',
                            'items': {
                                'type': 'string'
                            }
                        },
                        'keyword': {
                            'type': 'string'
                        }
                    }
                },
                isOnlyParents: { type: 'boolean' }
            }
        }
    },
    'POST /admin/master/list-by-search': {
        controller: 'Admin/MasterController',
        action: 'listBySearch',
        module: config.modules.master,
        operation: config.permission.list
    },
    'GET /admin/master/get-all-master-list': {
        controller: 'Admin/MasterController',
        action: 'allMasterList',
        module: config.modules.master,
        operation: config.permission.list
    },
    'POST /admin/master/list-by-code': {
        controller: 'Admin/MasterController',
        action: 'listByCode',
        module: config.modules.master,
        operation: config.permission.list,
        swagger: {
            summary: 'List Master By Its Code',
            description: 'This is for listing master',
            body: {
                masters: {
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    }
                },
                include: {
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    }
                }
            }
        }
    },
    'PUT /admin/master/:id': {
        controller: 'Admin/MasterController',
        action: 'update',
        module: config.modules.master,
        operation: config.permission.update,
        swagger: {
            summary: 'Update Master',
            description: 'This is for updating master',
            body: {
                name: { type: 'string' },
                code: { type: 'string' },
                group: { type: 'string' },
                description: { type: 'string' },
                isActive: { type: 'boolean' },
                isDefault: { type: 'boolean' },
                sequence: { type: 'number' },
                icon: { type: 'string' },
                image: { type: 'string' },
                parentId: { type: 'string' }
            }
        }
    },
    'POST /admin/master/bulk-sequence-update': {
        controller: 'Admin/MasterController',
        action: 'bulkSequenceUpdate',
        module: config.modules.master,
        operation: config.permission.update,
        swagger: {
            summary: 'Update Master',
            description: 'This is for updating master',
            body: {
                sequences: {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'id': {
                                'type': 'string'
                            },
                            'sequence': {
                                'type': 'number'
                            }
                        }
                    }
                }
            }
        }
    },
    'POST /admin/master/bulk-activate': 'Admin/MasterController.bulkActivate',
    'POST /admin/master/set-default': 'Admin/MasterController.setDefault',
    'GET /admin/master/:id': {
        controller: 'Admin/MasterController',
        action: 'view',
        module: config.modules.master,
        operation: config.permission.list,
        swagger: {
            summary: 'Detail Of Master',
            description: 'This is for detailing of master',
            body: {}
        }
    }
};
