module.exports = {
    PAYMENT_GATEWAYS: {
        STRIPE: 'STRIPE',
        NOQOODY: 'NOQOODY'
    },
    PAYMENT_ERRORS: {
        STRIPE: {
            card_not_supported: 'Card is not supported.',
            card_velocity_exceeded: 'Customer exceeded maximum credit limit of Card.',
            currency_not_supported: 'currency_not_supported.',
            duplicate_transaction: 'Transaction with provided amount submitted very recently.',
            expired_card: 'Card was expired.',
            fraudulent: 'Payment declined as we suspects it is fraudulent.',
            incorrect_cvc: 'CVC number is incorrect.',
            incorrect_pin: 'Entered pin is incorrect.',
            incorrect_zip: 'Postal zip code is incorrect.',
            insufficient_funds: 'Card has insufficient fund to complete this transaction.',
            invalid_account: 'Card or Account connected with card is invalid.',
            invalid_amount: 'Payment amount is invalid or exceeds the amount that is allowed.',
            invalid_cvc: 'CVC number is incorrect.',
            invalid_expiry_year: 'Invalid expiry year.',
            invalid_number: 'Card number is incorrect.',
            invalid_pin: 'Entered pin is incorrect.',
            issuer_not_available: 'Card issuer could not be reached.',
            lost_card: 'Payment declined due to card is reported lost',
            merchant_blacklist: 'Card is blocked by stripe',
            new_account_information_available: 'Card or Account connected with card is invalid.',
            not_permitted: 'Payment is not permitted.',
            offline_pin_required: 'Payment declined as card requires a PIN.',
            online_or_offline_pin_required: 'Payment declined as card requires a PIN.',
            pickup_card: 'Payment declined due to card is reported lost',
            pin_try_exceeded: 'The allowable number of PIN tries has been exceeded.',
            processing_error: 'An error occurred while processing the card.',
            reenter_transaction: 'The payment could not be processed by the issuer for an unknown reason.',
            restricted_card: 'Card cannot be used to make this payment.',
            stolen_card: 'Payment declined due to card is reported lost.',
            testmode_decline: 'Stripe test card number was used.',
            withdrawal_count_limit_exceeded: 'Customer exceeded maximum credit limit of Card.'
        },
        NOQOODY: {
            payment_link_fail: 'Fail to get payment links.',
            transaction_fail: 'Transaction is failed.'
        }
    },
    PAYMENT_STATUS: {
        SUCCESS: 'TXN_SUCCESS',
        FAILURE: 'TXN_FAILURE',
        PENDING: 'PENDING'
    }
};