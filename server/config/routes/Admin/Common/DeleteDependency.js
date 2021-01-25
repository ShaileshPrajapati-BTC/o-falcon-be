module.exports.routes = {
    /**************************************************************************
     * Common Controller                                                      *
     **************************************************************************/
    'post /admin/common/foreign-dependencies-count': 'Admin/Common/DeleteDependencyController.getForeignDependencies',
    'post /admin/common/foreign-dependencies-records': 'Admin/Common/DeleteDependencyController.getModelRecords',
    'put /admin/common/soft-delete-record': 'Admin/Common/DeleteDependencyController.softDeleteRecord',
    'post /admin/common/bulk-destroy': {
        controller: 'Admin/Common/DeleteDependencyController',
        action: 'bulkDestroy',
        swagger: {
            summary: 'Delete Of Data In Bulk',
            description: 'This is for deleting data in bulk',
            body: {
                ids: {type: 'array', required: true},
                model: {type: 'string', required: true},
                conference_id: {type: 'string', required: true},
            },
        }
    },
    'get /admin/empty-tables': 'Admin/Common/DeleteDependencyController.emptyTables'
    //'post /admin/common/bulk-destroy': 'Admin/Common/DeleteDependencyController.bulkDestroy',
};