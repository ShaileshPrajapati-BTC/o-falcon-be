module.exports = {
    tableName: 'ReferralBenefit',
    schema: true,
    attributes: {
        referralUserId: {
            model: 'user'
        },
        invitedUserId: {
            model: 'user'
        },
        amount: {
            type: 'number',
            defaultsTo: 0
        },
        benefit: {
            type: 'number',
        },
        type: {
            type: 'number',
            defaultsTo: sails.config.REFERRAL.TYPE.CODE
        },
        status: {
            type: 'number',
            defaultsTo: sails.config.REFERRAL.STATUS.PENDING
        },
        statusTrack: {
            type: 'json',
            columnType: 'array',
            description: {
                status: { type: 'integer' },
                dateTime: { type: 'datetime' },
                remark: { type: 'string' },
            }
        },
        isDeleted: {
            type: 'boolean'
        },
        isAddBenefit: {
            type: 'boolean'
        },
        userId: {
            model: 'user'
        },
    }
}