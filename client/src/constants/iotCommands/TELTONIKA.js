export const TELTONIKA = [
    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false, types: [1] },
    { label: 'Get Location', command: 'track', icon: 'Locations', isPopUp: false, types: [1, 2] }
];

export const TELTONIKA_TST100 = [
    { label: 'Light On', command: 'lightOn', icon: 'LightOn', isPopUp: false, types: [1] },
    { label: 'Light Off', command: 'lightOff', icon: 'LightOff', isPopUp: false, types: [1] },
    { label: 'Alarm On', command: 'alarmOn', icon: 'AlarmOn', isPopUp: false, types: [1, 2] },
    { label: 'Alarm Off', command: 'alarmOff', icon: 'AlarmOff', isPopUp: false, types: [1, 2] },
    { label: 'Max Speed', command: 'setMaxSpeed', icon: 'SetMaxSpeed', isPopUp: true, types: [1], key: 'maxSpeedLimit' }
];

export const TELTONIKA_TST100_FIT_RIDER = [
    { label: 'Light On', command: 'lightOn', icon: 'LightOn', isPopUp: false, types: [1] },
    { label: 'Light Off', command: 'lightOff', icon: 'LightOff', isPopUp: false, types: [1] },
    { label: 'Alarm On', command: 'alarmOn', icon: 'AlarmOn', isPopUp: false, types: [1, 2] },
    { label: 'Alarm Off', command: 'alarmOff', icon: 'AlarmOff', isPopUp: false, types: [1, 2] },
    { label: 'Max Speed', command: 'setMaxSpeed', icon: 'SetMaxSpeed', isPopUp: true, types: [1], key: 'maxSpeedLimit' }
];

export const TELTONIKA_TFT100 = [
    { label: 'Boot Open', command: 'bootOpen', icon: 'BootOpen', isPopUp: false, types: [1] },
    { label: 'Boot Close', command: 'bootClose', icon: 'BootClose', isPopUp: false, types: [1] }
];

export const TELTONIKA_FMB920 = [
    { label: 'Boot Open', command: 'bootOpen', icon: 'BootOpen', isPopUp: false, types: [1] },
    { label: 'Boot Close', command: 'bootClose', icon: 'BootClose', isPopUp: false, types: [1] }
];
