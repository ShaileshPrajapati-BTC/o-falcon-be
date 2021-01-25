module.exports.routes = {
    'POST /admin/version/create': 'Admin/Common/VersionController.create',
    'POST /admin/version/paginate': 'Admin/Common/VersionController.list',
    'POST /admin/version/bulk-destroy': 'Admin/Common/VersionController.bulkDestroy',
    'GET /admin/version/view/:id': 'Admin/Common/VersionController.view',
    'DELETE   /admin/version/destroy/:id': 'Admin/Common/VersionController.destroy',
    'put    /admin/version/setactive': 'Admin/Common/VersionController.setActive',
    'put    /admin/version/set-hard-update': 'Admin/Common/VersionController.setHardUpdate',
    'post   /admin/version/update': 'Admin/Common/VersionController.update',
    // 'post /admin/apk/share-link': 'Admin/Common/VersionController.shareLink'
    'GET /admin/project-latest-version': 'Admin/Common/VersionController.getProjectLatestVersion',
};
