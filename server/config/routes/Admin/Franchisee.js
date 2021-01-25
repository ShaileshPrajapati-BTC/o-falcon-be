module.exports.routes = {
    'POST /admin/franchisee/create': 'Admin/FranchiseeController.register',
    'POST /admin/franchisee/paginate': 'Admin/FranchiseeController.paginate',
    'GET /admin/franchisee/:id': 'Admin/FranchiseeController.view',
    'POST /admin/franchisee/vehicle-list': 'Admin/FranchiseeController.getVehicleOfFranchisee',
    'POST /admin/franchisee/assign-vehicle': 'Admin/FranchiseeController.assignVehicle',
    'POST /admin/franchisee/retain-vehicle': 'Admin/FranchiseeController.retainVehicle',
};
