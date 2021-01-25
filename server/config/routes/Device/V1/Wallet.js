module.exports.routes = {
    'POST /api/v1/customer/wallet/add-balance': {
        controller: 'Device/V1/WalletController',
        action: 'addBalance',
        swagger: {
            summary: 'Add balance to customer wallet.',
            description: '',
            body: {
                amount: {
                    type: 'number',
                    required: true
                }
            }
        }
    },

    'POST /api/v1/customer/wallet/transaction-list': {
        controller: 'Device/V1/WalletController',
        action: 'transactionList',
        swagger: {
            summary: 'List all wallet transaction.',
            description: ''
        }
    }
};
