module.exports.routes = {
    'POST /api/v1/feedback/give-feedback': {
        controller: 'Device/V1/FeedbackController',
        action: 'giveFeedback',
        swagger: {
            summary: 'Give feedback or suggestion',
            description: '',
            body: {
                feedback: {
                    type: 'string',
                    required: true
                }
            }
        }
    }
};
