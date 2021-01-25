module.exports.routes = {
    /** ************** admin user******************************************/
    "POST /admin/feeder/paginate": "Admin/FeederController.paginate",
    "GET /admin/feeder/:id": "Admin/FeederController.view",
    "PUT /admin/feeder/:id": "Admin/FeederController.update",
    "DELETE /admin/feeder/:id": "Admin/FeederController.delete",
};
