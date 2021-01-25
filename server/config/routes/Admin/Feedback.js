module.exports.routes = {
    'POST /admin/feedback/paginate': {
        controller: 'Admin/FeedbackController',
        action: 'paginate',
        swagger: {
            summary: 'List of Feedback.',
            description: '',
            body: {}
        }
    }
};
