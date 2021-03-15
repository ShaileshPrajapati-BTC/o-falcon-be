module.exports = {
    tableName: 'TransactionLog',
    schema: true,
    attributes: {
        transactionBy: { model: 'User' },
        transactionTo: { model: 'User' }, // For refund
        rideId: { model: 'RideBooking' },
        franchiseeId: { model: 'User' },
        dealerId: { model: 'User' },
        userType: { type: 'number' },
        remark: { type: 'string' },
        amount: { type: 'number' },
        paymentTransactionId: { type: 'string' },
        status: { type: 'number' },
        type: {
            type: 'number',
            description: 'credit = 1 or debit = 2'
        },
        // card no if amount debited
        card: {
            type: 'json',
            columnType: 'object',
            description: {
                last4: {
                    type: 'number',
                    example: 1234
                },
                expMonth: {
                    type: 'number',
                    example: 1
                },
                expYear: {
                    type: 'number',
                    example: 2021
                },
                brand: {
                    type: 'number',
                    example: 'Visa'
                },
                id: { type: 'string' }
            }
        },
        // account no if amount credited
        bankDetail: {
            type: 'json',
            columnType: 'object',
            description: {
                routingNumber: {
                    type: 'number',
                    example: 110000
                },
                accountNumber: {
                    type: 'number',
                    example: 1234567890
                },
                bankName: {
                    type: 'string',
                    example: 'STRIPE TEST BANK'
                },
                accountHolderName: {
                    type: 'string',
                    example: 'jerky'
                },
                id: { type: 'string' }
            }
        },
        chargeType: {
            type: 'number',
            required: true
        },
        refunded: { type: 'boolean' },
        fees: {
            type: 'json',
            columnType: 'object',
            description: {
                totalFee: {
                    type: 'number',
                    example: 2.04
                },
                stripeFee: {
                    type: 'number',
                    example: 1.85
                },
                tax: {
                    type: 'number',
                    example: 0.19
                }
            }
        },
        vehicleType: {
            type: 'number',
            extendedDescription: sails.config.VEHICLE_TYPE,
            defaultsTo: sails.config.DEFAULT_VEHICLE_TYPE
        },
        isWalletTransaction: {
            type: 'boolean',
            defaultsTo: false
        },
        proxyPayReferenceId: {
            type: 'number'
        },
        expiryDate: {
            type: 'string',
            columnType: 'datetime'
        },
        // Same using for MPGS as order_id
        noqoodyReferenceId: {
            type: 'string'
        },
        planInvoiceId: { model: 'PlanInvoice' },
        rideType: {
            type: 'number',
            defaultsTo: sails.config.RIDE_TYPE.DEFAULT,
            description: sails.config.RIDE_TYPE
        },
        statusTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                status: { type: 'integer' },
                dateTime: { type: 'datetime' },
                remark: { type: 'string' },
                payDate: { type: 'string' },
                payTime: { type: 'string' },
                payAuthCode: { type: 'string' }
            }
        },
        bonusAmount: {
            type: 'number',
            defaultsTo: 0
        },
        bonusTransactionId: { model: 'TransactionLog' },
        paytmOrderId: { type: 'string' },
        paytmData: {
            type: 'json'
        },
        inicisData: {
            type: 'json'
        },
        promoCodeId: { model: 'PromoCode' },
        promoCodeData: { type: 'json' }
    }
};
