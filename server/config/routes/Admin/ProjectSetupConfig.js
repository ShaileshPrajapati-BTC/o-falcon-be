module.exports.routes = {
    'GET /admin/config/project': 'Admin/ProjectSetupConfigController.getProjectConfig',
    'GET /admin/config/setup': 'Admin/ProjectSetupConfigController.getSetupConfig',
    'PUT /admin/config/project': 'Admin/ProjectSetupConfigController.updateProjectConfig',
    'PUT /admin/config/setup': 'Admin/ProjectSetupConfigController.updateSetupConfig',
    'GET /admin/config/device': 'Admin/ProjectSetupConfigController.getDeviceConfig',
    'PUT /admin/config/device': 'Admin/ProjectSetupConfigController.updateDeviceConfig'
};
