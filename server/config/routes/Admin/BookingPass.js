module.exports.routes = {
    'POST /admin/booking-pass/paginate': 'Admin/BookingPassController.paginate',
    'POST /admin/booking-pass/add': 'Admin/BookingPassController.add',
    'PUT /admin/booking-pass/:id': 'Admin/BookingPassController.update',
    'GET /admin/booking-pass/:id': 'Admin/BookingPassController.view',
};
