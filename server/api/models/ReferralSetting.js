module.exports = {
    tableName: 'ReferralSetting',
    schema: true,
    attributes: {
        referralUserBenefitType: {
            type: 'number' 
        },
        referralUserBenefitValue: {
            type: 'number' 
        },
        invitedUserBenefitType: {
            type: 'number',
        },
        invitedUserBenefitValue: {
            type: 'number',
        },
        country: {
            type: 'string'
        },
        isActive: {
            type: 'boolean'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        isDefault: {
            type: 'boolean',
            defaultsTo: false
        }
    }
}