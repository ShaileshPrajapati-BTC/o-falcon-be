const Codec12Service = require('./codec12/iot');

module.exports = {
    async sendCommand(vehicle, command, manufacturer, otherDetail) {
        if (command == 'start') {
            command = 'unlock';
        }
        if (command == 'stop') {
            command = 'lock';
        }
        switch (command) {
            case 'setMaxSpeed':
                command = sails.config.TELTONIKA.COMMANDS[manufacturer][command];
                if (otherDetail.value > 18) {
                    command += ' 1 ' + otherDetail.value;
                } else {
                    if (otherDetail.value > 30) {
                        otherDetail.value = 30;
                    }
                    command += ' 2 ' + otherDetail.value;
                }
                break;

            case 'bootOpen':
                command = sails.config.TELTONIKA.COMMANDS[manufacturer][command];
                setTimeout(async () => {
                    let commandToSend = sails.config.TELTONIKA.COMMANDS[manufacturer]['bootClose'];
                    Codec12Service.sendCommand(vehicle.imei, commandToSend, vehicle.userId);
                }, 5000);
                break;

            default:
                command = sails.config.TELTONIKA.COMMANDS[manufacturer][command];
                break;
        }
        let res = {};
        if (command) {
            res = await Codec12Service.sendCommand(vehicle.imei, command, vehicle.userId);
        } else {
            res = {
                isRequested: false,
                message: 'Command not sent because the scooter is not connected.'
            };
        }

        return res;
    }
};