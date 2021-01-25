/**
 * SeriesGenerator.js
 */

module.exports = {
    tableName: "SeriesGenerator",
    schema: true,
    attributes: {
        // type of Series Generator from constant
        type: {
            type: 'number'
        },
        // prefix of number setting
        prefix: {
            type: 'string'
        },
        // postfix of number setting
        postfix: {
            type: 'string'
        },
        // number starting from like 0,1 or 123
        startFrom: {
            type: 'number',
            defaultsTo: 1
        },
        totalEntry: {
            type: 'number',
        },
        // Start range length
        digitLength: {
            type: 'number'
        },
        isActive: {
            type: 'boolean',
            defaultsTo: true

        },
        franchiseeId: {
            model: 'user'
        },
        dealerId: {
            model: 'user'
        }
    }
};

