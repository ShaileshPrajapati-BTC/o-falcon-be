const UtilService = require("./util");
// const { Parser } = require("json2csv");
let fs = require("fs");
let moment = require("moment");

module.exports = {
    async exportExcel() {
        try {
            let data = await IOTCallbackInfoTrack.find({
                dataHex: { "!=": null },
            }).meta({ enableExperimentalDeepTargets: true });
            let fields = [
                { label: "Hex", value: "dataHex" },
                { label: "Created At", value: "createdAt" },
                { label: "ackResponse", value: "ackResponse" },
                { label: "dateTime", value: "dateTime" },
                { label: "lng", value: "lng" },
                { label: "lat", value: "lat" },
                { label: "altitude", value: "altitude" },
                { label: "angle", value: "angle" },
                { label: "satellites", value: "satellites" },
                { label: "satellitesSpeed", value: "satellitesSpeed" },
                { label: "eventIOId", value: "eventIOId" },
                { label: "event", value: "event" },
                { label: "ignition", value: "ignition" },
                { label: "movement", value: "movement" },
                { label: "dataMode", value: "dataMode" },
                { label: "networkSignal", value: "networkSignal" },
                { label: "sleepMode", value: "sleepMode" },
                { label: "gnssStatus", value: "gnssStatus" },
                { label: "digitalInput1", value: "digitalInput1" },
                { label: "digitalOutput1", value: "digitalOutput1" },
                { label: "digitalInput2", value: "digitalInput2" },
                { label: "digitalInput3", value: "digitalInput3" },
                { label: "digitalOutput2", value: "digitalOutput2" },
                { label: "ble1BatteryVoltage", value: "ble1BatteryVoltage" },
                { label: "ble2BatteryVoltage", value: "ble2BatteryVoltage" },
                { label: "ble3BatteryVoltage", value: "ble3BatteryVoltage" },
                { label: "ble4BatteryVoltage", value: "ble4BatteryVoltage" },
                { label: "batteryLevel", value: "batteryLevel" },
                { label: "digitalInput4", value: "digitalInput4" },
                { label: "btStatus", value: "btStatus" },
                { label: "instantMovement", value: "instantMovement" },
                { label: "doutOvercurrent1", value: "doutOvercurrent1" },
                { label: "doutOvercurrent2", value: "doutOvercurrent2" },
                { label: "gnssPDOP", value: "gnssPDOP" },
                { label: "gnssHDOP", value: "gnssHDOP" },
                { label: "externalVoltage", value: "externalVoltage" },
                { label: "speed", value: "speed" },
                { label: "gsmCellId", value: "gsmCellId" },
                { label: "gsmAreaCode", value: "gsmAreaCode" },
                { label: "batteryVoltage", value: "batteryVoltage" },
                { label: "batteryCurrent", value: "batteryCurrent" },
                { label: "analogInput1", value: "analogInput1" },
                { label: "fuelRateGPS", value: "fuelRateGPS" },
                { label: "axisX", value: "axisX" },
                { label: "axisY", value: "axisY" },
                { label: "axisZ", value: "axisZ" },
                { label: "analogInput2", value: "analogInput2" },
                { label: "ecoScore", value: "ecoScore" },
                { label: "bleTemp1", value: "bleTemp1" },
                { label: "bleTemp2", value: "bleTemp2" },
                { label: "bleTemp3", value: "bleTemp3" },
                { label: "bleTemp4", value: "bleTemp4" },
                { label: "ble1Humidity", value: "ble1Humidity" },
                { label: "ble2Humidity", value: "ble2Humidity" },
                { label: "ble3Humidity", value: "ble3Humidity" },
                { label: "ble4Humidity", value: "ble4Humidity" },
                { label: "activeGsmOperator", value: "activeGsmOperator" },
                { label: "tripOdometer", value: "tripOdometer" },
                { label: "totalOdometer", value: "totalOdometer" },
                { label: "fuelUsedGPS", value: "fuelUsedGPS" },
                { label: "dallasTemp1", value: "dallasTemp1" },
                { label: "dallasTemp2", value: "dallasTemp2" },
                { label: "dallasTemp3", value: "dallasTemp3" },
                { label: "dallasTemp4", value: "dallasTemp4" },
                {
                    label: "extendedAnalogInput1",
                    value: "extendedAnalogInput1",
                },
                {
                    label: "extendedAnalogInput2",
                    value: "extendedAnalogInput2",
                },
                { label: "iccid", value: "iccid" },
                { label: "dallasTempID1", value: "dallasTempID1" },
                { label: "dallasTempID2", value: "dallasTempID2" },
                { label: "dallasTempID3", value: "dallasTempID3" },
                { label: "dallasTempID4", value: "dallasTempID4" },
                { label: "iButton", value: "iButton" },
                { label: "mac", value: "mac" },
                { label: "iccid2", value: "iccid2" },
            ];
            let filePath = `/INFO_TRACK_DATA_${moment().format(
                "DDMMYYYY_hhmms"
            )}.xlsx`;
            let destination = `${sails.config.appPath}/assets${filePath}`;
            data = await _.map(data, (ride) => {
                // require("moment-duration-format");
                let obj = {
                    dataHex: ride.dataHex ? ride.dataHex : "",
                    createdAt: UtilService.formatDate(ride.createdAt),
                    ackResponse: ride.data.ackResponse ? ride.data.ackResponse : "",
                    dateTime: ride.data.dateTime ? ride.data.dateTime : "",
                    lng: ride.data.lng ? ride.data.lng : "",
                    lat: ride.data.lat ? ride.data.lat : "",
                    altitude: ride.data.altitude ? ride.data.altitude : "",
                    angle: ride.data.angle ? ride.data.angle : "",
                    satellites: ride.data.satellites ? ride.data.satellites : "",
                    satellitesSpeed: ride.data.satellitesSpeed
                        ? ride.data.satellitesSpeed
                        : "",
                    eventIOId: ride.data.eventIOId ? ride.data.eventIOId : "",
                    event: ride.data.event ? ride.data.event : "",
                    ignition: ride.data.ignition ? ride.data.ignition : "",
                    movement: ride.data.movement ? ride.data.movement : "",
                    dataMode: ride.data.dataMode ? ride.data.dataMode : "",
                    networkSignal: ride.data.networkSignal ? ride.data.networkSignal : "",
                    sleepMode: ride.data.sleepMode ? ride.data.sleepMode : "",
                    gnssStatus: ride.data.gnssStatus ? ride.data.gnssStatus : "",
                    digitalInput1: ride.data.digitalInput1 ? ride.data.digitalInput1 : "",
                    digitalOutput1: ride.data.digitalOutput1
                        ? ride.data.digitalOutput1
                        : "",
                    digitalInput2: ride.data.digitalInput2 ? ride.data.digitalInput2 : "",
                    digitalInput3: ride.data.digitalInput3 ? ride.data.digitalInput3 : "",
                    digitalOutput2: ride.data.digitalOutput2
                        ? ride.data.digitalOutput2
                        : "",
                    ble1BatteryVoltage: ride.data.ble1BatteryVoltage
                        ? ride.data.ble1BatteryVoltage
                        : "",
                    ble2BatteryVoltage: ride.data.ble2BatteryVoltage
                        ? ride.data.ble2BatteryVoltage
                        : "",
                    ble3BatteryVoltage: ride.data.ble3BatteryVoltage
                        ? ride.data.ble3BatteryVoltage
                        : "",
                    ble4BatteryVoltage: ride.data.ble4BatteryVoltage
                        ? ride.data.ble4BatteryVoltage
                        : "",
                    batteryLevel: ride.data.batteryLevel ? ride.data.batteryLevel : "",
                    digitalInput4: ride.data.digitalInput4 ? ride.data.digitalInput4 : "",
                    btStatus: ride.data.btStatus ? ride.data.btStatus : "",
                    instantMovement: ride.data.instantMovement
                        ? ride.data.instantMovement
                        : "",
                    doutOvercurrent1: ride.data.doutOvercurrent1
                        ? ride.data.doutOvercurrent1
                        : "",
                    doutOvercurrent2: ride.data.doutOvercurrent2
                        ? ride.data.doutOvercurrent2
                        : "",
                    gnssPDOP: ride.data.gnssPDOP ? ride.data.gnssPDOP : "",
                    gnssHDOP: ride.data.gnssHDOP ? ride.data.gnssHDOP : "",
                    externalVoltage: ride.data.externalVoltage
                        ? ride.data.externalVoltage
                        : "",
                    speed: ride.data.speed ? ride.data.speed : "",
                    gsmCellId: ride.data.gsmCellId ? ride.data.gsmCellId : "",
                    gsmAreaCode: ride.data.gsmAreaCode ? ride.data.gsmAreaCode : "",
                    batteryVoltage: ride.data.batteryVoltage
                        ? ride.data.batteryVoltage
                        : "",
                    batteryCurrent: ride.data.batteryCurrent
                        ? ride.data.batteryCurrent
                        : "",
                    analogInput1: ride.data.analogInput1 ? ride.data.analogInput1 : "",
                    fuelRateGPS: ride.data.fuelRateGPS ? ride.data.fuelRateGPS : "",
                    axisX: ride.data.axisX ? ride.data.axisX : "",
                    axisY: ride.data.axisY ? ride.data.axisY : "",
                    axisZ: ride.data.axisZ ? ride.data.axisZ : "",
                    analogInput2: ride.data.analogInput2 ? ride.data.analogInput2 : "",
                    ecoScore: ride.data.ecoScore ? ride.data.ecoScore : "",
                    bleTemp1: ride.data.bleTemp1 ? ride.data.bleTemp1 : "",
                    bleTemp2: ride.data.bleTemp2 ? ride.data.bleTemp2 : "",
                    bleTemp3: ride.data.bleTemp3 ? ride.data.bleTemp3 : "",
                    bleTemp4: ride.data.bleTemp4 ? ride.data.bleTemp4 : "",
                    ble1Humidity: ride.data.ble1Humidity ? ride.data.ble1Humidity : "",
                    ble2Humidity: ride.data.ble2Humidity ? ride.data.ble2Humidity : "",
                    ble3Humidity: ride.data.ble3Humidity ? ride.data.ble3Humidity : "",
                    ble4Humidity: ride.data.ble4Humidity ? ride.data.ble4Humidity : "",
                    activeGsmOperator: ride.data.activeGsmOperator
                        ? ride.data.activeGsmOperator
                        : "",
                    tripOdometer: ride.data.tripOdometer ? ride.data.tripOdometer : "",
                    totalOdometer: ride.data.totalOdometer ? ride.data.totalOdometer : "",
                    fuelUsedGPS: ride.data.fuelUsedGPS ? ride.data.fuelUsedGPS : "",
                    dallasTemp1: ride.data.dallasTemp1 ? ride.data.dallasTemp1 : "",
                    dallasTemp2: ride.data.dallasTemp2 ? ride.data.dallasTemp2 : "",
                    dallasTemp3: ride.data.dallasTemp3 ? ride.data.dallasTemp3 : "",
                    dallasTemp4: ride.data.dallasTemp4 ? ride.data.dallasTemp4 : "",
                    extendedAnalogInput1: ride.data.extendedAnalogInput1
                        ? ride.data.extendedAnalogInput1
                        : "",
                    extendedAnalogInput2: ride.data.extendedAnalogInput2
                        ? ride.data.extendedAnalogInput2
                        : "",
                    iccid: ride.data.iccid ? ride.data.iccid : "",
                    dallasTempID1: ride.data.dallasTempID1 ? ride.data.dallasTempID1 : "",
                    dallasTempID2: ride.data.dallasTempID2 ? ride.data.dallasTempID2 : "",
                    dallasTempID3: ride.data.dallasTempID3 ? ride.data.dallasTempID3 : "",
                    dallasTempID4: ride.data.dallasTempID4 ? ride.data.dallasTempID4 : "",
                    iButton: ride.data.iButton ? ride.data.iButton : "",
                    mac: ride.data.mac ? ride.data.mac : "",
                    iccid2: ride.data.iccid2 ? ride.data.iccid2 : ""
                };

                return obj;
            });

            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);
            console.log("destination", destination);
            console.log("filePath", filePath);
            fs.writeFileSync(destination, csv);
        } catch (error) {
            console.log("Error - | ", error);
        }
    },
};
