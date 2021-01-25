/**
 * WebSocket Server Settings
 * (sails.config.sockets)
 *
 * Use the settings below to configure realtime functionality in your app.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For all available options, see:
 * https://sailsjs.com/config/sockets
 */

module.exports.sockets = {

    /* **************************************************************************
     *                                                                          *
     * `transports`                                                             *
     *                                                                          *
     * The protocols or "transports" that socket clients are permitted to       *
     * use when connecting and communicating with this Sails application.       *
     *                                                                          *
     * > Never change this here without also configuring `io.sails.transports`  *
     * > in your client-side code.  If the client and the server are not using  *
     * > the same array of transports, sockets will not work properly.          *
     * >                                                                        *
     * > For more info, see:                                                    *
     * > https://sailsjs.com/docs/reference/web-sockets/socket-client           *
     *                                                                          *
     ***************************************************************************/

    transports: ['polling', 'websocket'],

    /* **************************************************************************
     *                                                                          *
     * `beforeConnect`                                                          *
     *                                                                          *
     * This custom beforeConnect function will be run each time BEFORE a new    *
     * socket is allowed to connect, when the initial socket.io handshake is    *
     * performed with the server.                                               *
     *                                                                          *
     * https://sailsjs.com/config/sockets#?beforeconnect                        *
     *                                                                          *
     ***************************************************************************/

    beforeConnect: async (handshake, proceed) => {
        // `true` allows the socket to connect.
        // (`false` would reject the connection)
        const headers = handshake.headers;
        if (!handshake.headers.authorization && handshake._query) {
            headers.authorization = handshake._query.authorization;
            headers.deviceid = handshake._query.deviceid;
            headers.socketId = handshake._query.socketId;
        }
        const token = headers.authorization;
        if (token && headers.deviceid) {
            try {
                const userData = await auth.validateToken(token);
                handshake.headers.userId = userData.id;
                handshake.headers.userType = userData.type;
                let userTypes = [
                    sails.config.USER.TYPE.SUPER_ADMIN,
                    sails.config.USER.TYPE.ADMIN,
                    sails.config.USER.TYPE.SUB_ADMIN
                ];
                let isAdminUser = userTypes.indexOf(userData.type) > -1;
                handshake.headers.isAdminUser = isAdminUser;

                return proceed(undefined, true);
            } catch (error) {
                console.log('error', error);
                // emit unAuthorized Event

                return proceed(undefined, false);
            }
        } else {
            return proceed(undefined, false);
        }
    },

    /* **************************************************************************
     *                                                                          *
     * `afterDisconnect`                                                        *
     *                                                                          *
     * This custom afterDisconnect function will be run each time a socket      *
     * disconnects                                                              *
     *                                                                          *
     ***************************************************************************/

    afterDisconnect: async (session, socket, done) => {
        const headers = socket.handshake.headers;
        if (headers.userId && headers.deviceid) {
            try {
                await user.logSocketId({
                    socketId: socket.id,
                    connect: false,
                    userId: headers.userId,
                    deviceId: headers.deviceid
                });
            } catch (error) {
                console.log('Socket disconnect: error', error);
            }
        }

        // By default: do nothing.
        // (but always trigger the callback)
        // return done();
    },

    /* **************************************************************************
     *                                                                          *
     * Whether to expose a 'GET /__getcookie' route that sets an HTTP-only      *
     * session cookie.                                                          *
     *                                                                          *
     ***************************************************************************/

    // grant3rdPartyCookie: true,


};
