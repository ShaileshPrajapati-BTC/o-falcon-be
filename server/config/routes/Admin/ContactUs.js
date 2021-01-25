module.exports.routes = {
    'POST /admin/contact-us/paginate': {
        controller: 'Admin/ContactUsController',
        action: 'paginate',
        swagger: {
            summary: 'List ContactUs Mail.',
            description: '',
            body: {}
        }
    }
};
