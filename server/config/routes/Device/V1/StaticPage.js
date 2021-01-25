module.exports.routes = {
    'GET /api/v1/static-page/:code': {
        controller: 'Device/V1/StaticPageController',
        action: 'getPage',
        swagger: {
            summary: 'Get Static Page.',
            description: '',
            body: {}
        }
    }
};
