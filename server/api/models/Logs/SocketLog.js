module.exports = {
    tableName: 'SocketLog',
    schema: true,
    attributes: {
        socketId: {
            type: 'string'
        },
        userId: {
            model: 'User'
        },
        event: {
            type: 'string'
        },
        remark: {
            type: 'string'
        },
        data: {
            type: 'json'
        }
    }
};