module.exports.routes = {
    'POST /admin/developer/update-ride-totalKM': 'Admin/DeveloperController.updateRideTotalKM',
    'POST /admin/developer/update-ride-totalKM-to-VehicleAndRideSummary': 'Admin/DeveloperController.updateRideTotalKMToVehicleAndRideSummary',
    'POST /admin/developer/delete-rides-and-update-user': 'Admin/DeveloperController.deleteRidesAndUpdateUser',
    'POST /admin/developer/delete-refer-transactions-and-update-user': 'Admin/DeveloperController.deleteReferTransactionsAndUpdateUser',
    'POST /admin/developer/delete-bonus-transactions-and-update-user': 'Admin/DeveloperController.deleteBonusTransactionsAndUpdateUser',
    'POST /admin/developer/delete-model-wise-data': 'Admin/DeveloperController.deleteModelWiseData',
    'POST /admin/developer/generate-excel-report': 'Admin/DeveloperController.generateExcelReport',    
    'POST /admin/developer/delete-extra-ride-transactions-and-update-user': 'Admin/DeveloperController.deleteExtraRideTransactionsAndUpdateUser',
    'POST /admin/developer/recalculate-ride-fare': 'Admin/DeveloperController.recalculateRideFare',
}