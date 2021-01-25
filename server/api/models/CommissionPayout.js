module.exports = {
    tableName: 'CommissionPayout',
    schema: true,
    attributes: {
        requestId: {
            type: 'string'
        },
        franchiseeId: {
            model: 'User',
            required: true
        },
        amount: {
            type: 'number',
            required: true
        },
        dateTime: {
            type: 'string',
            columnType: 'datetime'
        },
        remark: {
            type: 'string'
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        transferredDateTime: {
            type: 'string',
            columnType: 'datetime'
        },
        rejectionDatetime: {
            type: 'string',
            columnType: 'datetime'
        },
        statusTrack: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
            description: {
                status: { type: 'integer' },
                dateTime: { type: 'datetime' },
                userId: { type: 'string' },
                remark: { type: 'string' }
            }
        }
    }
};
