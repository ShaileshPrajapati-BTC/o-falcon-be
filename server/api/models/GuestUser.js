module.exports = {
    tableName: 'GuestUser',
    schema: true,
    attributes: {
        firstName: {
            type: 'string',
            required: true
        },
        verification: {
            type: 'json',
            description: {
                token: { type: 'string' },
                expireTime: { type: 'datetime' }
            }
        },
        mobiles: {
            type: 'json',
            columnType: 'array',
            description: {
                mobile: {
                    type: 'string',
                    required: true,
                    unique: true
                },
                countryCode: { type: 'string' }
            }
        },
        emails: {
            type: 'json',
            columnType: 'array',
            description: {
                email: {
                    type: 'string',
                    required: true,
                    unique: true
                }
            }
        },
    }
};
