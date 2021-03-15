export const OMNI = [
    { label: 'Light On', command: 'lightOn', icon: 'LightOn', isPopUp: false, types: [1] },
    { label: 'Light Off', command: 'lightOff', icon: 'LightOff', isPopUp: false, types: [1] },
    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false, types: [1] },
    { label: 'Get Location', command: 'location', icon: 'Locations', isPopUp: false, types: [1, 2] },
    { label: 'Max Speed', command: 'setMaxSpeed', icon: 'SetMaxSpeed', isPopUp: true, types: [1], key: 'maxSpeedLimit' },
    { label: 'Ping Interval', command: 'setPingInterval', icon: 'SetPingInterval', isPopUp: true, types: [1], key: 'pingInterval' },
    { label: 'Ride Ping Interval', command: 'setRidePingInterval', icon: 'SetRidePingInterval', isPopUp: true, types: [1], key: 'ridePingInterval' }
];

export const OMNI_TCP_SCOOTER = [
    { label: 'Light On', command: 'lightOn', icon: 'LightOn', isPopUp: false, types: [1] },
    { label: 'Light Off', command: 'lightOff', icon: 'LightOff', isPopUp: false, types: [1] },
    { label: 'Alarm On', command: 'alarmOn', icon: 'AlarmOn', isPopUp: false, types: [1, 2] },
    { label: 'Alarm Off', command: 'alarmOff', icon: 'AlarmOff', isPopUp: false, types: [1, 2] },
    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false, types: [1] },
    { label: 'Get Location', command: 'location', icon: 'Locations', isPopUp: false, types: [1, 2] },
    { label: 'Max Speed', command: 'setMaxSpeed', icon: 'SetMaxSpeed', isPopUp: true, types: [1], key: 'maxSpeedLimit' },
    { label: 'Ping Interval', command: 'setPingInterval', icon: 'SetPingInterval', isPopUp: true, types: [1], key: 'pingInterval' },
    { label: 'Ride Ping Interval', command: 'setRidePingInterval', icon: 'SetRidePingInterval', isPopUp: true, types: [1], key: 'ridePingInterval' },
    { label: 'BatteryLock Unlock', command: 'L5', commandValue: '1', icon: 'Batunlock', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'WheelLock Unlock', command: 'L5', commandValue: '2', icon: 'wheelLockUnlock', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'CabelLock Unlock', command: 'L5', commandValue: '3', icon: 'CableLockUnlock', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'BatteryLock Lock', command: 'L5', commandValue: '17', icon: 'BatteryLock', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'WheelLock Lock', command: 'L5', commandValue: '18', icon: 'BatteryLock', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'CabelLock Lock', command: 'L5', commandValue: '19', icon: 'CableLock', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Check BatteryLock Status', command: 'L5', commandValue: '33', icon: 'BatteryStatus', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Check WheelLock Status', command: 'L5', commandValue: '34', icon: 'WheelStatus', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Check CabelLock Status', command: 'L5', commandValue: '35', icon: 'CableStatus', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Obtain Scooter Information', command: 'S6', icon: 'CableStatus', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Throttle On', command: 'throttleOn', icon: 'Idleledon', isPopUp: false, types: [1] },
    { label: 'Throttle Off', command: 'throttleOff', icon: 'Idleledoff', isPopUp: false, types: [1] },
];

export const OMNI_TCP_BICYCLE = [
    { label: 'Alarm On', command: 'alarmOn', icon: 'AlarmOn', isPopUp: false, types: [1, 2] },
    { label: 'Alarm Off', command: 'alarmOff', icon: 'AlarmOff', isPopUp: false, types: [1, 2] },
    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false, types: [1] },
    { label: 'Get Location', command: 'location', icon: 'Locations', isPopUp: false, types: [1, 2] }
];

export const OMNI_TCP_BICYCLE_SAMPLE_LOCK = [
    { label: 'Alarm On', command: 'alarmOn', icon: 'AlarmOn', isPopUp: false, types: [1, 2] },
    { label: 'Alarm Off', command: 'alarmOff', icon: 'AlarmOff', isPopUp: false, types: [1, 2] },
    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false, types: [1] },
    { label: 'Get Location', command: 'location', icon: 'Locations', isPopUp: false, types: [1, 2] }
];