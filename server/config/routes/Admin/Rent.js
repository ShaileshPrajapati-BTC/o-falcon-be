module.exports.routes = {
    "PUT /admin/rent/update-default-rent":
        "Admin/RentController.updateDefaultRent",
    "PUT /admin/rent/update-user-rent":
        "Admin/RentController.updateUserRent",
    "POST /admin/rent-list": "Admin/RentController.paginate",
    'GET /admin/rent/:id': 'Admin/RentController.getRent'
};
