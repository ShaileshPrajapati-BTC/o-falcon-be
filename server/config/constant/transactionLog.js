module.exports = {
    TRANSACTION_LOG: {
        STATUS: {
            CARD_VERIFY: 1,
            RIDE_COMPLETED: 2,
            FAILED_PAYMENT_CHARGE: 4,
            REFUND: 5,
            WALLET_CREDIT: 6,
            WALLET_DEBIT: 7,
            RIDE_DEPOSIT: 8,
            PROMO_CODE_WALLET: 9
        },
        REMARK: {
            ADD_WALLET_BY_ADMIN: 'Wallet added by Admin',
            ADD_WALLET_BY_SYSTEM: 'Wallet added by system'
        },
    },
    TRANSACTION_STATUS: {
        1: 'Card Verify',
        2: 'Ride Completed',
        4: 'Failed Payment Charge',
        5: 'Refund',
        6: 'Wallet Credit',
        7: 'Wallet Debit',
        8: 'Ride Deposit',
        9: 'Promocode wallet'
    }
};
