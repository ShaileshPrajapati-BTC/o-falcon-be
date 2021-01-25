const TeltonikaService = require('../../services/IOT/TELTONIKA/Scooter/HTTP/callback');
const CellocatorService = require('../../services/IOT/CELLOCATOR/Scooter/HTTP/callback');

module.exports = {
    async receiveCallback(req, res) {
        try {
            const params = req.allParams();
            console.log("*********************PointerTeltonika Callback***************************");
            console.log(params);
            let vehicle = await Vehicle.findOne({ imei: params.imei_no }).populate('manufacturer');
            if (!vehicle || !vehicle.manufacturer) {
                return res.json({
                    result: "false",
                    msg: "Fails"
                });
            }
            let manufacturer = sails.config.VEHICLE_MANUFACTURER;
            switch (vehicle.manufacturer.code) {
                case manufacturer.TELTONIKA:
                    TeltonikaService.receiveCallback(vehicle, params);
                    break;

                case manufacturer.CELLOCATOR_TCP_SCOOTER:
                    CellocatorService.receiveCallback(vehicle, params);
                    break;

                default:
                    break;
            }

            return res.json({
                result: "true",
                msg: "Success"
            });
        } catch (error) {
            console.log(error);

            return res.json({
                result: "false",
                msg: "Fails"
            });
        }

    }
};