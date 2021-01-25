module.exports.routes = {
    /** ************** admin user******************************************/
    'GET /admin/template/create': 'Admin/Common/CommonAPITemplateController.create',
    'POST /admin/user/create': 'Admin/UserController.register',
    'POST /admin/user/paginate': 'Admin/UserController.paginate',
    'POST /admin/user/reset-password': 'Admin/UserController.resetPassword',
    'GET /admin/user/:id': 'Admin/UserController.view',
    'PUT /admin/user/:id': 'Admin/UserController.update',
    'DELETE /admin/user/:id': 'Admin/UserController.delete',
    'POST /admin/user/patients': 'Admin/UserController.patientList',
    'POST /admin/user/assign-doctor-to-home-area': 'Admin/UserController.AssignDoctorToHomeArea',
    'POST /admin/user/approve-documents': 'Admin/UserController.approveDocuments',
    'PUT /admin/user/active-deactive': 'Admin/UserController.activeDeactive',
    'POST /admin/user/assign-roles': {
        controller: 'Admin/UserController',
        action: 'assignRoleToMultipleUser',
        swagger: {
            summary: 'assign role to user',
            description: '',
            body: {}
        }
    },
    'POST /admin/user/user-list': 'Admin/UserController.userList',
    'POST /admin/user/franchisee-list': 'Admin/UserController.franchiseeList',
    'POST /admin/user/get-location': 'Admin/UserController.getCityOpration',
    'POST /admin/user/plan-invoice-list': 'Admin/UserController.planInvoiceList',
    'POST /admin/user/dealer-list': 'Admin/UserController.dealerList',
    'POST /admin/user/dl-number-verify': 'Admin/UserController.drivingLicenseNumberVerification',
    'POST /admin/user/dl-image-verify': 'Admin/UserController.drivingLicenseImageVerification',
    'POST /admin/user/selfie-verify': 'Admin/UserController.selfieVerification',
    'POST /admin/user/add-dummy-document': 'Admin/UserController.addDummyDocuments',
    'POST /admin/user/add-referral-code': 'Admin/UserController.addReferralCode',
    'POST /admin/user/export-users':'Admin/UserController.exportUsers',
};
