module.exports = {
    tableName: 'DeviceConfig',
    schema: true,
    attributes: {
        poweredBy: { type: 'string' }
    }
};

// function yourFunction(){
//     console.log('--- ', sails.config.POWERED_BY);
//     setTimeout(yourFunction, 5000);
// }

// yourFunction();