module.exports.routes = {
    "POST /admin/rent-payment/paginate": "Admin/RentPaymentController.paginate",
    "POST /admin/rent-payment/change-status":
        "Admin/RentPaymentController.changeStatus",
    "POST /admin/rent-payment/summary":
        "Admin/RentPaymentController.rentPaymentSummary",
    "GET /admin/rent-payment/summary/:id":
        "Admin/RentPaymentController.rentPaymentSummaryById",
    "GET /admin/rent-payment/make-dummy-data":
        "Admin/RentPaymentController.makeDummyData",
};
