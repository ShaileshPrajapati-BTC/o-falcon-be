export const CELLOCATOR_TCP_SCOOTER = [
    { label: 'Reconnect', command: 'track', icon: 'Track', isPopUp: false, types: [1] },
    { label: 'Get Location', command: 'location', icon: 'Locations', isPopUp: false, types: [1, 2] },
    { label: 'Ping Interval', command: 'setPingInterval', icon: 'SetPingInterval', isPopUp: true, types: [1], key: 'pingInterval' },
    { label: 'Ride Ping Interval', command: 'setRidePingInterval', icon: 'SetRidePingInterval', isPopUp: true, types: [1], key: 'ridePingInterval' }
];