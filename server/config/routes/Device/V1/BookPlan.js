module.exports.routes = {
    "POST /api/v1/customer/book-plan/list": {
        controller: "Device/V1/BookPlanController",
        action: "list",
        swagger: {
            summary: "List Book Plans.",
            description: "",
            body: {}
        }
    },
    "GET /api/v1/customer/book-plan/:id": {
        controller: "Device/V1/BookPlanController",
        action: "view",
        swagger: {
            summary: "View Book Plan",
            description: "",
            body: {}
        }
    },
    "POST /api/v1/customer/book-plan/make-payment": {
        controller: "Device/V1/BookPlanController",
        action: "buyPlan",
        swagger: {
            summary: "Buy the plan",
            description: "buy current plan,next plan or upgrade plan",
            body: {
                planId: {
                    type: "string",
                    required: true
                },
                planBuyType: {
                    type: "number",
                    required: true
                }
            }
        }
    },
    "POST /api/v1/customer/book-plan/cancel-plan": {
        controller: "Device/V1/BookPlanController",
        action: "cancelPlan",
        swagger: {
            summary: "Cancel the plan (Current or Next)",
            description: "",
            body: {
                planCancelType: {
                    type: "number",
                    required: true
                }
            }
        }
    },
    "GET /api/v1/customer/book-plan/user-active-plans": {
        controller: "Device/V1/BookPlanController",
        action: "userActivePlans",
        swagger: {
            summary: "User Current and Next Plan",
            description: "",
            body: {}
        }
    },
    "POST /api/v1/customer/book-plan/renew-plan": {
        controller: "Device/V1/BookPlanController",
        action: "renewPlan",
        swagger: {
            summary: "Renew the last purchased plan",
            description: "",
            body: {
                planId: {
                    type: "string",
                    required: true
                }
            }
        }
    },
    "POST /api/v1/customer/book-plan/plan-invoice-list": "Device/V1/BookPlanController.planInvoiceList"
};
