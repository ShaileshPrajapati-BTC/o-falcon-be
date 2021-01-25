module.exports.routes = {
    'POST /admin/referral-setting/paginate': {
        controller: 'Admin/Common/ReferralSettingController',
        action: 'paginate',
    },

    'POST /admin/referral-setting/create': {
        controller: 'Admin/Common/ReferralSettingController',
        action: 'create',
    },

    "PUT /admin/referral-setting/:id": {
        controller: "Admin/Common/ReferralSettingController",
        action: "update",
    },

    'DELETE /admin/referral-setting/:id': {
        controller: 'Admin/Common/ReferralSettingController',
        action: 'delete',
    },

    'GET /admin/referral-setting/:id': {
        controller: 'Admin/Common/ReferralSettingController',
        action: 'view',
    },
};
