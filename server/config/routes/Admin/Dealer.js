module.exports.routes = {
    'POST /admin/dealer/create': 'Admin/DealerController.register',
    'POST /admin/dealer/assign-vehicle': 'Admin/DealerController.assignVehicle',
    'POST /admin/dealer/paginate': 'Admin/DealerController.paginate',
    'GET /admin/dealer/:id': 'Admin/DealerController.view',
    'POST /admin/dealer/vehicle-list': 'Admin/DealerController.getVehicleOfDealer',
    'POST /admin/dealer/retain-vehicle': 'Admin/DealerController.retainVehicle',
}