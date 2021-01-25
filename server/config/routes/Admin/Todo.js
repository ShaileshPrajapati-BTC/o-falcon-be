module.exports.routes = {

    'POST /admin/todo/paginate': {
        controller: 'Admin/TodoController',
        action: 'paginate',
        swagger: {
            summary: 'List todo.',
            description: '',
            body: {}
        }
    },

    'POST /admin/todo/add': {
        controller: 'Admin/TodoController',
        action: 'add',
        swagger: {
            summary: 'Add Todo.',
            description: '',
            body: {
                title: {
                    type: 'string'
                },
                description: {
                    type: 'string'
                },
                priority: {
                    type: 'string'
                },
                status: {
                    type: 'string'
                },
                completedAt: {
                    type: 'string'
                },
                dueDate: {
                    type: 'string'
                },
                attachment: {
                    type: 'array',
                    items: {
                        id: {
                            type: 'string'
                        },
                        path: {
                            type: 'string'
                        },
                        fileName: {
                            type: 'string'
                        }
                    }
                },
                assignedTo: {
                    type: 'array',
                    items: {
                        id: {
                            type: 'string'
                        },
                        userId: {
                            type: 'string'
                        }
                    }
                },
                progress: {
                    type: 'number'
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

    'PUT /admin/todo/:id': {
        controller: 'Admin/TodoController',
        action: 'update',
        swagger: {
            summary: 'Add Todo.',
            description: '',
            body: {
                title: {
                    type: 'string'
                },
                description: {
                    type: 'string'
                },
                priority: {
                    type: 'string'
                },
                completedAt: {
                    type: 'string'
                },
                dueDate: {
                    type: 'string'
                },
                attachment: {
                    type: 'array',
                    items: {
                        id: {
                            type: 'string'
                        },
                        path: {
                            type: 'string'
                        },
                        fileName: {
                            type: 'string'
                        }
                    }
                },
                assignedTo: {
                    type: 'array',
                    items: {
                        id: {
                            type: 'string'
                        },
                        userId: {
                            type: 'string'
                        }
                    }
                },
                progress: {
                    type: 'number'
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

    'GET /admin/todo/:id': {
        controller: 'Admin/TodoController',
        action: 'view',
        swagger: {
            summary: 'Get Todo list.',
            description: '',
            body: {}
        }
    },

    'DELETE /admin/todo/:id': {
        controller: 'Admin/TodoController',
        action: 'delete',
        swagger: {
            summary: 'Delete todo.',
            description: '',
            body: {}
        }
    },
}