module.exports.routes = {
    'PUT /admin/franchisee/commission/update-all-commissions': 'Admin/CommissionController.updateAllCommissionSettings',
    'PUT /admin/franchisee/commission/update-commission': 'Admin/CommissionController.updateCommissionOfFranchisee',
    'POST /admin/franchisee/commission-list': 'Admin/CommissionController.paginate',
    'POST /admin/franchisee/unpaid-commission': 'Admin/CommissionController.getUnpaidCommission',
    'POST /admin/franchisee/get-all-franchisee-commission-list': 'Admin/CommissionController.getCommissionListOfAllFranchisee'
};
