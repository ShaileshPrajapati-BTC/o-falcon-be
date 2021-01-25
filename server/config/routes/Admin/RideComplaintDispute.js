module.exports.routes = {
    'POST /admin/ride-complaint-dispute/paginate': {
        controller: 'Admin/RideComplaintDisputeController',
        action: 'paginate',
        swagger: {
            summary: 'List dispute.',
            description: '',
            body: {
                page: { type: 'number' },
                limit: { type: 'number' },
                filter: { type: 'object' },
                dateRange: {
                    type: 'object',
                    properties: {
                        from: { type: 'string' },
                        to: { type: 'string' }
                    }
                }

            }
        }
    },

    'POST /admin/ride-complaint-dispute/status-update': {
        controller: 'Admin/RideComplaintDisputeController',
        action: 'statusUpdate',
        swagger: {
            summary: 'update dispute status.',
            description: '',
            body: {
                status: { type: 'number' },
                disputeIds: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            remark: { type: 'string' }
                        }
                    }
                }
            }
        }
    },

    'POST /admin/ride-complaint-dispute/create': {
        controller: 'Admin/RideComplaintDisputeController',
        action: 'addServiceRequest',
        swagger: {
            summary: 'Add priority.',
            description: '',
            body: {
                    userId: "string",
                    actionQuestionnaireId: "string",
                    answer: "string",
                    attachments: [
                      {
                        path: "string",
                        type: 0,
                        isPrimary: true
                      }
                    ],
                    franchiseeId: { type: 'string' }
            }
        }
    },

    'POST /admin/ride-complaint-dispute/priority-update': {
        controller: 'Admin/RideComplaintDisputeController',
        action: 'priorityUpdate',
        swagger: {
            summary: 'Add priority.',
            description: '',
            body: {
                priority: { type: 'number' },
                disputeIds: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            remark: { type: 'string' }
                        }
                    }
                }
            }
        }
    },

    'POST /admin/ride-complaint-dispute/send-conversation': {
        controller: 'Admin/RideComplaintDisputeController',
        action: 'sendConversation',
        swagger: {
            summary: 'Send email.',
            description: '',
            body: {
                disputeIds: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            remark: { type: 'string' }
                        }
                    }
                }
            }
        }
    }
};

