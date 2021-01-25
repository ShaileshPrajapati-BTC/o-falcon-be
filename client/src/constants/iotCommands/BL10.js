export const BL10_BICYCLE = [
    { label: 'Alarm On', command: 'alarmOn', icon: 'AlarmOn', isPopUp: false },
    { label: 'Alarm Off', command: 'alarmOff', icon: 'AlarmOff', isPopUp: false },

    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false },
    { label: 'Get Location', command: 'location', icon: 'Locations', isPopUp: false },

    { label: 'Ping Interval', command: 'setPingInterval', icon: 'SetPingInterval', isPopUp: true, key: 'pingInterval' },
    { label: 'Ride Ping Interval', command: 'setRidePingInterval', icon: 'SetRidePingInterval', isPopUp: true, key: 'ridePingInterval' },

    { label: 'Check firmware version', command: 'VERSION#', icon: 'Getmt1packet', isPopUp: false, isNewMethod: true },
    { label: 'Check parameters', command: 'PARAM#', icon: 'Getmt1packet', isPopUp: false, isNewMethod: true },
    { label: 'Query device network setting', command: 'GPRSSET#', icon: 'Getmt1packet', isPopUp: false, isNewMethod: true },
    { label: 'Check status', command: 'STATUS#', icon: 'Getmt1packet', isPopUp: false, isNewMethod: true },
    { label: 'Check URL', command: 'URL#', icon: 'Getmt1packet', isPopUp: false, isNewMethod: true },
    { label: 'Check APN', command: 'APN#', icon: 'Getmt1packet', isPopUp: false, isNewMethod: true },
    // { label: 'Set server parameters', command: 'SERVER', icon: 'Getmt1packet', isPopUp: true, isNewMethod: true },
    { label: 'Reboot', command: 'RESET#', icon: 'Restart', isPopUp: false, isNewMethod: true },
    { label: 'Activate GPS', command: 'GPSON#', icon: 'Locations', isPopUp: false, isNewMethod: true },
    { label: 'GPS OFF', command: 'GPSOFF#', icon: 'Locations', isPopUp: false, isNewMethod: true },
    { label: 'Activate GPS with time', command: 'GPSON', icon: 'Locations', isPopUp: true, isNewMethod: true },
    { label: 'Set the vibration alarm', command: 'SENALM,ON#', icon: 'AlarmOn', isPopUp: false, isNewMethod: true },
    { label: 'Set the low battery alarm', command: 'BATALM', icon: 'AlarmOn', isPopUp: true, isNewMethod: true },
    { label: 'Find BIKE by sound', command: 'SDFIND', icon: 'Buzon', isPopUp: true, isNewMethod: true }

];