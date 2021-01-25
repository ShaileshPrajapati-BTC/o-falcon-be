module.exports.routes = {

    'POST /admin/payment/paginate': {
        controller: 'Admin/PaymentController',
        action: 'paginate',
        swagger: {
            summary: 'List payment.',
            description: '',
            body: {}
        }
    },
    'POST /admin/payment/handle-stripe-accounts': {
        controller: 'Admin/PaymentController',
        action: 'handleStripeAccounts',
        swagger: {
            summary: 'List payment.',
            description: '',
            body: {}
        }
    },

    'POST /admin/payment/add-bank-account': {
        controller: 'Admin/PaymentController',
        action: 'addBankAccount',
        swagger: {
            summary: '',
            description: '',
            body: {
                "userId": {
                    type: "string",
                    required: true
                },
                "bankDetails": {
                    type: "object",
                    required: true,
                    properties: {
                        "accountNumber": {
                            type: "string"
                        },
                        "accountHolderName": {
                            type: "string"
                        },
                        "routingNumber": {
                            type: "string"
                        },
                        "bankId": {
                            type: "string"
                        },
                        "accountType": {
                            type: "number"
                        },
                        "isPrimary": {
                            type: "boolean"
                        }
                    }
                }
            }
        }
    },
    "POST /admin/payment/default-bank-account": {
        "controller": "Admin/PaymentController",
        "action": "setDefaultBankAccount",
        "swagger": {
            "summary": "set Default Bank Account",
            "description": "",
            "body": {
                "userId": {
                    type: "string",
                    required: true
                },
                "bankAccountId": {
                    type: "string",
                    required: true
                }
            }
        }
    },

    "POST /admin/payment/remove-bank-account": {
        "controller": "Admin/PaymentController",
        "action": "removeBankAccount",
        "swagger": {
            "summary": "remove bank account",
            "description": "",
            "body": {
                "userId": {
                    type: "string",
                    required: true
                },
                "bankAccountId": {
                    type: "string",
                    required: true
                }
            }
        }
    },

    'PUT /admin/payment/update-bank-account': {
        controller: 'Admin/PaymentController',
        action: 'updateBankAccount',
        swagger: {
            summary: '',
            description: '',
            body: {
                "userId": {
                    type: "string",
                    required: true
                },
                "bankDetails": {
                    type: "object",
                    required: true,
                    properties: {
                        "bankAccountId": {
                            type: "string",
                            required: true
                        },
                        "accountNumber": {
                            type: "string"
                        },
                        "accountHolderName": {
                            type: "string"
                        },
                        "routingNumber": {
                            type: "string"
                        },
                        "bankName": {
                            type: "string"
                        },
                        "accountType": {
                            type: "number"
                        },
                        "isPrimary": {
                            type: "boolean"
                        }
                    }
                }
            }
        }
    },

    "POST /admin/payment/user-bank-account": {
        "controller": "Admin/PaymentController",
        "action": "userBankAccount",
        "swagger": {
            "summary": "User all Bank Account",
            "description": "",
            "body": {
                "userId": {
                    type: "string",
                    required: true
                }
            }
        }
    },

    "POST /admin/stripe/empty-stripe-ids": {
        "controller": "Admin/PaymentController",
        "action": "emptyStripeIds",
        "swagger": {
            "summary": "Null the stripe ids of the old customers",
            "description": "",
            "body": {}
        }
    },

    "POST /admin/payment/debit-wallet": {
        "controller": "Admin/PaymentController",
        "action": "debitWallet",
        "swagger": {
            "summary": "Null the stripe ids of the old customers",
            "description": "",
            "body": {}
        }
    },
    'POST /admin/payment/updateStatusForNoqoodyTransaction': 'Admin/PaymentController.updateStatusForNoqoodyTransaction',
    'POST /admin/payment/updateStatusForNoqoodyTransactionViaReferenceIds': 'Admin/PaymentController.updateStatusForNoqoodyTransactionViaReferenceIds',
}