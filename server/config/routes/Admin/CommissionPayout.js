module.exports.routes = {
    'POST /admin/franchisee/commission-payout/get-requests': 'Admin/CommissionPayoutController.paginate',
    'POST /admin/franchisee/commission-payout/change-status': 'Admin/CommissionPayoutController.changeStatus',
    'POST /admin/franchisee/commission-payout/add': 'Admin/CommissionPayoutController.addCommissionPayout',
    'POST /admin/franchisee/commission-payout/get-pending-commission': 'Admin/CommissionPayoutController.getPendingCommission',
    'PUT /admin/franchisee/commission-payout/update-amount': 'Admin/CommissionPayoutController.updateAmountOfPayoutRequest'
};
