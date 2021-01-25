module.exports.routes = {
    /************* Notification ************************************/
    'post /admin/file-operator/import-excel': 'Admin/Common/FileOperatorController.importExcel',
    'get /admin/file-operator/export-excel': 'Admin/Common/FileOperatorController.exportExcel',
    'post /admin/file-upload': 'Admin/Common/FileOperatorController.uploadFiles',
    'post /admin/remove-file': 'Admin/Common/FileOperatorController.removeFiles',
    'post /admin/export-model-excel': 'Admin/Common/FileOperatorController.exportModelExcel'
};

// {
// 	"model": "User",
// 	"fields": ["emails", "mobiles"],
// 	"where": {
// 		"type": 5,
// 		"parentId": { "!=": null }
//     },
//     "limit": 5,
// 	"subData": {
//         "parentId" : {
//             "prefix": "Client",
//             "fields": [
//                 "name"
//             ]
//         }
//     }
// }