
module.exports = {
    tableName: 'ContactUsSetting',
    schema: true,
    attributes: {
        email: {
            type: 'string',
            required: true
        },
        cell: {
            type: 'string',
            required: true
        },
        address: {
            type: 'string',
        },
        addedBy: {
            model: 'User',
        }
    }
};
