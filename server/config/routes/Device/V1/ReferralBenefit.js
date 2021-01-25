module.exports.routes = {
    'POST /api/v1/customer/referral-benefit/paginate': {
        controller: 'Device/V1/ReferralBenefitController',
        action: 'paginate',
    },
    'GET /api/v1/customer/referral-benefit/:id': {
        controller: 'Device/V1/ReferralBenefitController',
        action: 'view',
    },
}