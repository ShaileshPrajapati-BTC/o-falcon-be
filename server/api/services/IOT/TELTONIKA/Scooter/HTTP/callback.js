const IoTCallbackHandler = require('../../../../iotCallbackHandler');
module.exports = {
    async receiveCallback(vehicle, data) {
        await IoTCallbackHandler.updateVehicle(vehicle, data);
    }
};