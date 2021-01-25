// module.exports.mqtt = {
//     _hookTimeout: 20000,
//     broker: 'ws://47.254.79.66:8083/mqtt',
//     connect: {
//         port: 8083,
//         username: 'admin',
//         password: 'public',
//         clientId: `mqttjs_mqttjs_7fbd97e848_${new Date().getTime()}`,
//         qos: 0,
//         will: {
//             topic: 'server/disconnect',
//             payload: JSON.stringify({ msg: 'i am off-line' }),
//             qos: 0,
//             clean: false
//         }
//     },
//     publishOption: {
//         qos: 0,
//         retain: true,
//         dup: false
//     },
//     subscribeOption: { qos: 0 },
//     topics: [
//         'topic/#'
//     ],
//     handler: require('../mqtt/handler.js')
// };
