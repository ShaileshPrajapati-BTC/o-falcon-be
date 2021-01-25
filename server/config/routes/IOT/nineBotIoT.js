module.exports.routes = {
    'POST /iot/nine-bot-callback/vehicle/alert': 'IOT/NinebotController.getScooterAlert',
    'POST /iot/nine-bot-callback/vehicle/fault': 'IOT/NinebotController.getScooterFault',
    'POST /iot/nine-bot-callback/vehicle/status': 'IOT/NinebotController.getScooterStatus',
    'POST /iot/nine-bot-callback/firmware/upgrade/complete': 'IOT/NinebotController.getScooterUpgradeCallback'
};