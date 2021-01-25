module.exports.routes = {
    'POST /api/v1/faqs/paginate': {
        controller: 'Device/V1/FaqsController',
        action: 'paginate',
        swagger: {
            summary: 'List Faqs.',
            description: '',
            body: {}
        }
    }
};
