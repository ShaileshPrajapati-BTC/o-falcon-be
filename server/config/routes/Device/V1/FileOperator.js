module.exports.routes = {
    /************* Notification ************************************/
    'post /api/v1/upload-file': 'Device/V1/FileOperatorController.uploadFiles',
    'post /api/v1/remove-file': 'Device/V1/FileOperatorController.removeFiles',
    'post /api/v1/upload-sheet': 'Device/V1/FileOperatorController.uploadExcelSheet'
};