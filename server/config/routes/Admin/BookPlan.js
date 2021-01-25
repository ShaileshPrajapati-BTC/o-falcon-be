module.exports.routes = {
    'POST /admin/book-plan/paginate': 'Admin/BookPlanController.paginate',
    'POST /admin/book-plan/add': 'Admin/BookPlanController.add',
    'PUT /admin/book-plan/:id': 'Admin/BookPlanController.update',
    'GET /admin/book-plan/:id': 'Admin/BookPlanController.view',
    'POST /admin/book-plan/active-plans': 'Admin/BookPlanController.userActivePlans',
    'DELETE /admin/book-plan/:id': 'Admin/BookPlanController.delete'
};
