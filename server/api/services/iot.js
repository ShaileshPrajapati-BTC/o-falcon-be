const OmniIotService = require('./IOT/OMNI/Scooter/HTTP/iot');
const OmniTcpScooterIotService = require('./IOT/OMNI/Scooter/TCP/iot');
const OmniBicycleIotService = require('./IOT/OMNI/Bicycle/TCP/iot');
const OmniEBikeIotService = require('./IOT/OMNI/Ebike/TCP/iot');

const ZimoIotService = require('./IOT/ZIMO/Scooter/MQTT/iot');

const ZkScooterIotService = require('./IOT/ZK/Scooter/TCP/iot');

const CoruscateService = require('./IOT/CORUSCATE/HTTP/iot');
const TeltonikaService = require('./IOT/TELTONIKA/Scooter/TCP/iot');
const Bl10BicycleService = require('./IOT/BL10/Bicycle/TCP/iot');
const NineBotScooterService = require('./IOT/NINEBOT/Scooter/HTTP/iot');
const FitRiderService = require('./IOT/FITCOO/Scooter/MQTT/iot');
const ItriangleService = require('./IOT/ITRIANGLE/Scooter/TCP/iot');
const CellocatorService = require('./IOT/CELLOCATOR/Scooter/TCP/iot');
const TxedService = require('./IOT/TXED/Scooter/TCP/iot');

module.exports = {

    // Set location callback time
    async geLocation(scooter, seconds) {
        const command = 'track';
        const manufacturer = scooter.manufacturer.code;
        if (!scooter.connectionStatus) {
            return true;
        }
        let res = await this.sendRequestToServer(
            manufacturer,
            command,
            scooter,
            seconds
        );

        return res;
    },

    async lockUnlock(command, scooter, rideNumber) {
        if (!scooter.connectionStatus) {
            switch (command) {
                case 'lock':
                    throw sails.config.message.SCOOTER_NOT_CONNECTED_WHILE_RIDE;
                case 'unlock':
                    throw sails.config.message.SCOOTER_NOT_CONNECTED_WHILE_RIDE;
                default:
                    throw sails.config.message.SCOOTER_NOT_CONNECTED;
            }
        }
        const manufacturer = scooter.manufacturer.code;
        let res = await this.sendLockUnlockRequestToServer(
            manufacturer,
            command,
            scooter,
            rideNumber
        );

        return res;
    },

    async commandToPerform(command, scooter, data) {
        if (!scooter.connectionStatus && command != 'track') {
            throw sails.config.message.SCOOTER_NOT_CONNECTED;
        }
        const manufacturer = scooter.manufacturer.code;
        let res = await this.sendRequestToServer(
            manufacturer,
            command,
            scooter,
            data
        );

        return res;
    },

    async sendRequestToServer(manufacturer, command, data, extraData = null) {
        let res = {};
        const manufacturers = sails.config.VEHICLE_MANUFACTURER;
        switch (true) {
            case manufacturer === manufacturers.OMNI && typeof OmniIotService[command] === 'function':
                res = await OmniIotService[command](data, extraData);
                break;

            case manufacturer === manufacturers.ZIMO && typeof ZimoIotService[command] === 'function':
                res = await ZimoIotService[command](data, extraData);
                break;

            case manufacturer === manufacturers.CORUSCATE_IOT && typeof CoruscateService[command] === 'function':
                // console.log('command-=' + command);
                res = await CoruscateService[command](data, extraData);
                break;

            case (manufacturer === manufacturers.OMNI_TCP_BICYCLE || manufacturer === manufacturers.OMNI_TCP_BICYCLE_SAMPLE_LOCK) && typeof OmniBicycleIotService[command] === 'function':
                res = await OmniBicycleIotService[command](data, extraData);
                break;

            case manufacturer === manufacturers.ZK_SCOOTER && typeof ZkScooterIotService[command] === 'function':
                res = await ZkScooterIotService[command](data, extraData);
                break;

            case manufacturer === manufacturers.OMNI_TCP_SCOOTER && typeof OmniTcpScooterIotService[command] === 'function':
                res = await OmniTcpScooterIotService[command](data, extraData);
                break;

            case manufacturer === manufacturers.OMNI_TCP_E_BIKE && typeof OmniEBikeIotService[command] === 'function':
                res = await OmniEBikeIotService[command](data, extraData);
                break;

            case manufacturer.startsWith('TELTONIKA'):
                res = await TeltonikaService.sendCommand(data, command, manufacturer, extraData);
                break;

            case manufacturer === manufacturers.BL10_TCP_BICYCLE && typeof Bl10BicycleService[command] === 'function':
                res = await Bl10BicycleService[command](data, extraData);
                break;

            case manufacturer.startsWith('NINEBOT_SCOOTER') && typeof NineBotScooterService[command] === 'function':
                data.manufacturerRegion = manufacturer;
                res = await NineBotScooterService[command](data, extraData);
                break;

            case manufacturer === manufacturers.FITRIDER_SCOOTER && typeof FitRiderService[command] === 'function':
                res = await FitRiderService[command](data, extraData);
                break;

            case manufacturer === manufacturers.ITRIANGLE_SCOOTER && typeof ItriangleService[command] === 'function':
                res = await ItriangleService[command](data, extraData);
                break;

            case manufacturer === manufacturers.CELLOCATOR_TCP_SCOOTER && typeof CellocatorService[command] === 'function':
                res = await CellocatorService[command](data, extraData);
                break;

            default:
                break;
        }
        return res;
    },

    async sendLockUnlockRequestToServer(manufacturer, command, data, extraData = null) {
        let res = {};
        const manufacturers = sails.config.VEHICLE_MANUFACTURER;
        switch (manufacturer) {
            case manufacturers.OMNI:
                res = await OmniIotService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.ZIMO:
                res = await ZimoIotService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.CORUSCATE_IOT:
                console.log(`command-=${command}`);
                res = await CoruscateService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.OMNI_TCP_BICYCLE:
                res = await OmniBicycleIotService.lockUnlock(command, data, extraData);
                break;
            case manufacturers.OMNI_TCP_BICYCLE_SAMPLE_LOCK:
                res = await OmniBicycleIotService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.ZK_SCOOTER:
                res = await ZkScooterIotService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.OMNI_TCP_SCOOTER:
                res = await OmniTcpScooterIotService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.OMNI_TCP_E_BIKE:
                res = await OmniEBikeIotService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.TELTONIKA_TST100:
                res = await TeltonikaService.sendCommand(data, command, manufacturer, extraData);
                break;

            case manufacturers.TELTONIKA_TST100_FIT_RIDER:
                res = await TeltonikaService.sendCommand(data, command, manufacturer, extraData);
                break;

            case manufacturers.TELTONIKA_TFT100:
                res = await TeltonikaService.sendCommand(data, command, manufacturer, extraData);
                break;

            case manufacturers.TELTONIKA_FMB920:
                res = await TeltonikaService.sendCommand(data, command, manufacturer, extraData);
                break;

            case manufacturers.BL10_TCP_BICYCLE:
                res = await Bl10BicycleService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.NINEBOT_SCOOTER_US:
                data.manufacturerRegion = manufacturer;
                res = await NineBotScooterService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.NINEBOT_SCOOTER_EU:
                data.manufacturerRegion = manufacturer;
                res = await NineBotScooterService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.FITRIDER_SCOOTER:
                res = await FitRiderService.lockUnlock(command, data, extraData);
                break;

            case manufacturers.CELLOCATOR_TCP_SCOOTER:
                res = CellocatorService.lockUnlock(command, data, extraData);
                break;

            default:
                break;
        }

        return res;
    },

    async setOmniCallback() {
        await OmniIotService.setOmniCallback();
    },

    getBatteryPercentageFromVolt(voltage, batteryConfig) {
        let volt = parseFloat(voltage);
        if (volt) {
            volt /= 100;
        }
        let percentage = 0;
        for (let [index, batteryData] of batteryConfig.entries()) {
            if (volt >= batteryData.volt) {
                if (index == 0) {
                    percentage = batteryData.percentage;
                    break;
                }
                let nextBatteryData = batteryData;
                batteryData = batteryConfig[parseInt(index) - 1];
                let totalDiff = (batteryData.volt - nextBatteryData.volt) / (batteryData.percentage - nextBatteryData.percentage);
                let calculatedIncrementPercentage = (volt - nextBatteryData.volt) / totalDiff;
                percentage = nextBatteryData.percentage + Math.ceil(calculatedIncrementPercentage);

                break;
            }
        }
        return percentage;
    },

    async setDefaultIOTCommands(vehicle) {
        try {
            console.log('setDefaultIOTCommands vehicle.omniCode', vehicle.omniCode);
            const manufacturer = vehicle.manufacturer.code;
            if (sails.config.DEFAULT_VEHICLE_SPEED_LIMIT_ENABLED) {
                await this.sendRequestToServer(
                    manufacturer,
                    "setMaxSpeed",
                    vehicle,
                    { value: sails.config.DEFAULT_VEHICLE_SPEED_LIMIT }
                );
            }
            if (sails.config.DEFAULT_PING_INTERVAL_ENABLED) {
                await this.sendRequestToServer(
                    manufacturer,
                    "setPingInterval",
                    vehicle,
                    { value: sails.config.DEFAULT_PING_INTERVAL }
                );
            }
            if (sails.config.DEFAULT_RIDE_PING_INTERVAL_ENABLED) {
                await this.sendRequestToServer(
                    manufacturer,
                    "setRidePingInterval",
                    vehicle,
                    { value: sails.config.DEFAULT_RIDE_PING_INTERVAL }
                );
            }
            if (sails.config.DEFAULT_POSITION_PING_INTERVAL_ENABLED) {
                await this.sendRequestToServer(
                    manufacturer,
                    "setPositionPingInterval",
                    vehicle,
                    { value: sails.config.DEFAULT_POSITION_PING_INTERVAL }
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
};
