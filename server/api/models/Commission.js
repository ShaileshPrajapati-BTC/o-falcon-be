module.exports = {
    tableName: 'Commission',
    schema: true,
    attributes: {
        franchiseeId: {
            model: 'user',
            required: true
        },
        type: {
            type: 'number',
            defaultsTo: 0
        },
        percentage: {
            type: 'number',
            defaultsTo: 0.00
        },
        amount: {
            type: 'number',
            defaultsTo: 0.00
        },
        track: {
            type: 'json',
            columnType: 'array',
            description: {
                data: { type: 'json' },
                type: { type: 'number' },
                percentage: { type: 'number' },
                amount: { type: 'number' },
                dateTime: { type: 'datetime' },
                userId: { model: 'user' },
                remark: { type: 'string' }
            }
        }
    }
}