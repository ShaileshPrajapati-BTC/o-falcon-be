export const ITRIANGLE_SCOOTER = [
    { label: 'Light On', command: 'lightOn', icon: 'LightOn', isPopUp: false, types: [1] },
    { label: 'Light Off', command: 'lightOff', icon: 'LightOff', isPopUp: false, types: [1] },
    { label: 'Alarm On', command: 'alarmOn', icon: 'AlarmOn', isPopUp: false, types: [1, 2] },
    { label: 'Alarm Off', command: 'alarmOff', icon: 'AlarmOff', isPopUp: false, types: [1, 2] },
    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false, types: [1] },
    { label: 'Get Location', command: 'location', icon: 'Locations', isPopUp: false, types: [1, 2] },
    { label: 'Max Speed', command: 'setMaxSpeed', icon: 'SetMaxSpeed', isPopUp: true, types: [1], key: 'maxSpeedLimit' },
    { label: 'Ping Interval', command: 'setPingInterval', icon: 'SetPingInterval', isPopUp: true, types: [1], key: 'pingInterval' },
    { label: 'Ride Ping Interval', command: 'setRidePingInterval', icon: 'SetRidePingInterval', isPopUp: true, types: [1], key: 'ridePingInterval' }
];