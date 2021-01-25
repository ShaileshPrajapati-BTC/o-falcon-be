module.exports.routes = {
    'POST /api/v1/customer/contact-us': {
        controller: 'Device/V1/ContactUsController',
        action: 'add',
        swagger: {
            summary: 'Send contact mail.',
            description: 'Send contact mail.',
            body: {
                subject: {
                    type: 'string',
                    required: true
                },
                message: {
                    type: 'string',
                    required: true
                },
                attachments: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        }
    }
};
