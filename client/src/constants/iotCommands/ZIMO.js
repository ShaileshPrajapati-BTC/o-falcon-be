export const ZIMO = [
    { label: 'Light On', command: 'lighton', icon: 'LightOn', isPopUp: true, types: [1], isNewMethod: true },
    { label: 'Light Off', command: 'lightoff', icon: 'LightOff', isPopUp: false, types: [1], isNewMethod: true },

    { label: 'Alarm On', command: 'alarmon', icon: 'AlarmOn', isPopUp: true, types: [1], isNewMethod: true },
    { label: 'Alarm Off', command: 'alarmoff', icon: 'AlarmOff', isPopUp: false, types: [1], isNewMethod: true },

    { label: 'Buzzer On', command: 'buzon', icon: 'Buzon', isPopUp: true, types: [1], isNewMethod: true },
    { label: 'Buzzer Off', command: 'buzoff', icon: 'Buzoff', isPopUp: false, types: [1], isNewMethod: true },

    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false, types: [1] },
    { label: 'Get Location', command: 'location', icon: 'Locations', isPopUp: false, types: [1, 2] },


    { label: 'Idle LED On', command: 'idleledon', icon: 'Idleledon', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Idle LED Off', command: 'idleledoff', icon: 'Idleledoff', isPopUp: false, types: [1], isNewMethod: true },

    { label: 'Restart', command: 'restart', icon: 'Restart', isPopUp: false, types: [1], isNewMethod: true },

    { label: 'Line Unlock', command: 'lineunlock', icon: 'Lineunlock', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Bat Unlock', command: 'batunlock', icon: 'Batunlock', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Bat Lock', command: 'batlock', icon: 'Batlock', isPopUp: false, types: [1], isNewMethod: true },

    { label: 'Ble Off', command: 'bleoff', icon: 'Bleoff', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Ble On', command: 'bleon', icon: 'Bleon', isPopUp: false, types: [1], isNewMethod: true },


    { label: 'Get Config', command: 'getconfig', icon: 'Getconfig', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Get mt1', command: 'getmt1packet', icon: 'Getmt1packet', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Get mt2', command: 'getmt2packet', icon: 'Getmt2packet', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Get mt5', command: 'getmt5packet', icon: 'Getmt5packet', isPopUp: false, types: [1], isNewMethod: true },
    { label: 'Get mt6', command: 'getmt6packet', icon: 'Getmt6packet', isPopUp: false, types: [1], isNewMethod: true },

    { label: 'Max Speed', command: 'setMaxSpeed', icon: 'SetMaxSpeed', isPopUp: true, types: [1], key: 'maxSpeedLimit' },
    { label: 'Ping Interval', command: 'setPingInterval', icon: 'SetPingInterval', isPopUp: true, types: [1], key: 'pingInterval' },
    { label: 'Ride Ping Interval', command: 'setRidePingInterval', icon: 'SetRidePingInterval', isPopUp: true, types: [1], key: 'ridePingInterval' },

    // { label: 'Upload Files', command: 'uploadFileToScooter', icon: 'UploadFileToScooter', isPopUp: false, types: [1] },
    // { label: 'Auto Play Enable', command: 'autoPlayEnable', icon: 'AutoPlayEnable', isPopUp: false, types: [1] },
    // { label: 'Auto Play Disable', command: 'autoPlayDisable', icon: 'AutoPlayDisable', isPopUp: false, types: [1] },
    // { label: 'Play Audio', command: 'playaudio', icon: 'PlayAudio', isPopUp: true, types: [1], isNewMethod: true },
    // { label: 'Stop Audio', command: 'audiooff', icon: 'Audiooff', isPopUp: false, types: [1], isNewMethod: true },
    // { label: 'Play Audio with Sequence', command: 'listpaly', icon: 'Listplay', isPopUp: true, types: [1], isNewMethod: true },

];