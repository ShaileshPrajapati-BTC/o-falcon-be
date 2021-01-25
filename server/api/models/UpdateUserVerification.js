module.exports = {
    tableName: 'UpdateUserVerification',
    schema: true,
    attributes: {
        userId: {
            model: 'User',
            required: true
        },
        token: {
            type: 'string',
            required: true
        },
        expireTime: {
            type: 'string',
            columnType: 'datetime'
        },
        updatedField: {
            type: 'number',
            required: true
        }
    }
};