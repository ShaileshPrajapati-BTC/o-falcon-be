module.exports = {
    tableName: "IOTCommandCallbackTrack",
    schema: true,
    attributes: {
        imei: {
            type: "string",
            required: true
        },
        logType: {
            type: 'number'
        },
        commandName: { type: 'string' },
        sentCommand: { type: 'string' },
        actualCallback: { type: 'string' },
        decodedCallback: { type: 'json' }
    }
};