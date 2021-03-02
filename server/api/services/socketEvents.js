const UserService = require('./user');
const DashboardService = require('./dashboard');
// const moment = require('moment');
// const CommonService = require('./common');
const UtilService = require('./util');
// const EmailService = require('./email');
// const AuthService = require('./auth');
const TaskService = require('./task');
const NestService = require('./nest');
const OperationalHoursService = require('./operationalHours');
const router = require('socket.io-events')();
const moment = require('moment');

module.exports = {
    socketEvents() {
        let self = this;
        router.on('*', async (socket, args, next) => {
            let name = args.shift();
            let data = args.shift();
            console.log('event emitted', name);
            console.log('event data', data);
            let eventName = '';

            switch (name) {
                case 'getVehicles':
                    eventName = 'getVehicles';
                    self.getVehicleData(socket);
                    break;
                case 'CheckInHub':
                    eventName = 'CheckInHub';
                    self.checkVehicleInHub(socket, data);
                    break;
                case 'adminPageChange':
                    eventName = 'adminPageChange';
                    self.adminPageChange(socket, data);
                    break;
                case 'getAdminNotificationCount':
                    eventName = 'getAdminNotificationCount';
                    self.getAdminNotificationCount(socket, data);
                    break;
                case 'levelFilter':
                    eventName = 'levelFilter';
                    self.taskLevelFilter(socket, data);
                    break;
                case 'findFalconDetail':
                    eventName = 'findFalconDetail';
                    self.findFalconDetail(socket, data);
                    break;
                case 'findNest':
                    eventName = 'findNest';
                    self.findNest(socket, data);
                    break;
                case 'claimNest':
                    eventName = 'claimNest';
                    self.claimNest(socket, data);
                    break;
                case 'nestDetails':
                    eventName = 'nestDetails';
                    self.nestDetails(socket, data);
                    break;
                case 'cancelClaimNest':
                    eventName = 'cancelClaimNest';
                    self.cancelClaimNest(socket, data);
                    break;
                case 'checkIsVehicleInNest':
                    eventName = 'checkIsVehicleInNest';
                    self.checkIsVehicleInNest(socket, data);
                    break;
                case 'taskList':
                    eventName = 'taskList';
                    self.taskList(socket, data);
                    break;
                case 'taskView':
                    eventName = 'taskView';
                    self.taskView(socket, data);
                    break;
                case 'taskNavigate':
                    eventName = 'taskNavigate';
                    self.taskNavigate(socket, data);
                    break;
                case 'nestList':
                    eventName = 'nestList';
                    self.nestList(socket, data);
                    break;
                case 'nestView':
                    eventName = 'nestView';
                    self.nestView(socket, data);
                    break;
                case 'nestNavigate':
                    eventName = 'nestNavigate';
                    self.nestNavigate(socket, data);
                    break;
                case 'activeRide':
                    eventName = 'activeRide';
                    self.sendActiveRideEvent('', socket);
                    break;
                case 'operationHours':
                    if (!sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                        break;
                    }
                    eventName = 'operationHours';
                    let hoursSocketData = await this.getOperationalHoursSocketData();
                    if (hoursSocketData) {
                        await this.endTimeOperationalHours(hoursSocketData, socket);
                    }
                    break;

            }
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            await SocketLog.create({
                event: eventName,
                userId: userId,
                remark: sails.config.SOCKET.LOG_TYPE.EVENT_LISTEN,
                data: data
            });
            next();
        });
        sails.io.use(router);
        // on connection
        sails.io.on('connect', async (socket) => {
            const headers = socket.handshake.headers;
            const userId = socket.handshake.headers.userId;

            if (headers && userId) {
                if (userId && headers.deviceid) {
                    try {
                        const options = {
                            socketId: socket.id,
                            userId: userId,
                            deviceId: headers.deviceid,
                            connect: true,
                            userType: socket.handshake.headers.userType,
                            isAdminUser: socket.handshake.headers.isAdminUser
                        };
                        let response = await UserService.logSocketId(options);
                        if (!response.flag) {
                            return {
                                flag: false,
                                message: sails.config.message.SERVER_ERROR.message
                            };
                        }
                        sails.sockets.join(socket, 'connectedClients');

                        let responseData = {};

                        //console.log('connected', userId);
                        this.sendActiveRideEvent(userId, socket);

                        if (sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                            let hoursSocketData = await this.getOperationalHoursSocketData();
                            if (hoursSocketData) {
                                this.endTimeOperationalHours(hoursSocketData, options);
                            }
                        }

                        await SocketLog.create({
                            event: 'loginSocket',
                            userId: userId,
                            remark: sails.config.SOCKET.LOG_TYPE.LOGIN,
                            data: {
                                flag: true,
                                message: 'SocketId logged successfully.',
                                data: responseData
                            }
                        });

                        return {
                            flag: true,
                            message: 'SocketId logged successfully.',
                            data: responseData
                        };

                    } catch (error) {
                        console.log('error', error);
                        await SocketLog.create({
                            event: 'loginSocket',
                            remark: sails.config.SOCKET.LOG_TYPE.LOGIN,
                            data: {
                                flag: false,
                                message: 'SocketId login failed.',
                                data: error
                            }
                        });
                        // emit unAuthorized Event
                        socket.disconnect();
                    }
                } else {
                    await SocketLog.create({
                        event: 'loginSocket',
                        remark: sails.config.SOCKET.LOG_TYPE.LOGIN,
                        data: {
                            flag: false,
                            message: 'SocketId login failed.',
                            data: error
                        }
                    });
                    socket.disconnect();
                }
            } else {
                await SocketLog.create({
                    event: 'loginSocket',
                    remark: sails.config.SOCKET.LOG_TYPE.LOGIN,
                    data: {
                        flag: false,
                        message: 'SocketId login failed.',
                        data: error
                    }
                });
                socket.disconnect();
            }
        });

        // on connection
        sails.io.on('disconnect', (socket) => {
            console.log('disconnected', socket.id);
        });
    },

    async sendActiveRideEvent(userId, socket) {
        if (!userId) {
            let socketObj = sails.sockets.get(socket.id);
            userId = socketObj.handshake.headers.userId;
        }

        let activeRide = await RideBooking
            .findOne({
                status: [
                    sails.config.RIDE_STATUS.RESERVED,
                    sails.config.RIDE_STATUS.UNLOCK_REQUESTED,
                    sails.config.RIDE_STATUS.ON_GOING
                ],
                userId: userId
            })
            .populate('vehicleId')
            .populate('zoneId')
            .populate('planInvoiceId', { select: ['id', 'planName'] })
            .populate('dealerId')
            .populate('franchiseeId');

        if (activeRide) {
            // no need this field for mobile side, and need object if field is given
            delete activeRide.vehicleId.nestId;
            if (activeRide.status === sails.config.RIDE_STATUS.UNLOCK_REQUESTED) {
                activeRide.error = sails.config.message.SCOOTER_DISCONNECTED_WHILE_RIDE;
            }
            if (activeRide.zoneId) {
                activeRide.zoneId = await this.addSubZones(activeRide.zoneId);
            }

            this.activeRide(activeRide, { socketId: socket.id });
        }
    },
    async activeRide(data, socket) {
        try {
            console.log('socket');
            console.log(socket);
            console.log('socket');
            let message = 'Ride updated.';
            if (data.error && data.error.message) {
                message = data.error.message;
            }
            console.log('message', message);
            sails.sockets.get(socket.socketId).emit('activeRide', {
                flag: !data.error,
                message: message,
                data: data
            });
            // let socketObj = sails.sockets.get(socket.id);
            // let userId = socketObj && socketObj.handshake && socketObj.handshake.headers && socketObj.handshake.headers.userId || null;
            // await SocketLog.create({
            //     event: 'activeRide',
            //     remark: sails.config.SOCKET.LOG_TYPE.EVENT_EMIT,
            //     data: data,
            //     userId: userId
            // });
        } catch (error) {
            console.log('activeRide error', error);
            await UserService.logSocketId({
                socketId: socket.id,
                connect: false,
                userId: socket.userId,
                deviceId: socket.deviceId,
                userType: socket.userType,
                isAdminUser: socket.isAdminUser
            });
        }
    },
    async locationUpdate(data, socket) {
        try {
            sails.sockets.get(socket.socketId).emit('locationUpdate', {
                flag: true,
                message: 'Ride location updated.',
                data: data
            });
            // let socketObj = sails.sockets.get(socket.id);
            // let userId = socketObj && socketObj.handshake && socketObj.handshake.headers && socketObj.handshake.headers.userId || null;
            // await SocketLog.create({
            //     event: 'locationUpdate',
            //     remark: sails.config.SOCKET.LOG_TYPE.EVENT_EMIT,
            //     userId: userId,
            //     data: data
            // });
        } catch (error) {
            console.log('locationUpdate error', error);
            await UserService.logSocketId({
                socketId: socket.id,
                connect: false,
                userId: socket.userId,
                deviceId: socket.deviceId,
                userType: socket.userType,
                isAdminUser: socket.isAdminUser
            });
        }
    },

    async getAdminSockets(from) {
        // let adminUsers = await UserService.getAllAdmin();
        // let socketData = [];
        // _.each(adminUsers, (user) => {
        //     _.each(user.connectedSockets, (socket) => {
        //         if (socket.socketId) {
        //             let socketDetails = {
        //                 userId: user.id,
        //                 id: socket.socketId,
        //                 deviceId: socket.deviceId
        //             }
        //             socketData.push(socketDetails);
        //         }
        //     })
        // });
        // console.log(`getAdminSockets called from ${from}, ${sails.config.GET_ADMIN_SOCKETS_INVOKED++}, ADMIN_USER_SOCKET_ARRAY length = `, sails.config.ADMIN_USER_SOCKET_ARRAY.length);

        return sails.config.ADMIN_USER_SOCKET_ARRAY;
    },

    async notifyLocationAdmin(data, locationDiff) {
        let socketData = await this.getAdminSockets();
        if (!socketData || !socketData.length) {
            return true;
        }
        for (let newSocket of socketData) {
            try {
                if (!newSocket || !newSocket.id) {
                    continue;
                }
                let socket = sails.sockets.get(newSocket.id);
                if (!socket || !socket.id) {
                    await UserService.logSocketId({
                        socketId: newSocket.id,
                        connect: false,
                        userId: newSocket.userId,
                        deviceId: newSocket.deviceId,
                        userType: newSocket.userType,
                        isAdminUser: newSocket.isAdminUser
                    });

                    return true;
                }
                let page = socket.handshake.headers.page;
                let vehicleId = socket.handshake.headers.vehicleId;
                let isSend = false;
                if (page === sails.config.SOCKET_PAGE.DASHBOARD && locationDiff > 0) {
                    isSend = true;
                } else if (page === sails.config.SOCKET_PAGE.VEHICLE_DETAILS && vehicleId === data.vehicleData.id
                ) {
                    isSend = true;
                } else if (page === sails.config.SOCKET_PAGE.RIDES && data.rideId) {
                    // todo
                    // isSend = true;
                }
                // console.log('isSend', data.vehicleData.id, isSend);
                if (isSend) {
                    let responseData = {
                        flag: true,
                        message: 'Vehicle location updated.',
                        data: data
                    };
                    socket.emit('vehicleUpdate', responseData);
                    // let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
                    // await SocketLog.create({
                    //     event: 'vehicleUpdate',
                    //     remark: sails.config.SOCKET.LOG_TYPE.EVENT_EMIT,
                    //     userId: userId,
                    //     data: data
                    // });
                }
            } catch (error) {
                console.log('Socket not found: error', newSocket);
                await UserService.logSocketId({
                    socketId: newSocket.id,
                    connect: false,
                    userId: newSocket.userId,
                    deviceId: newSocket.deviceId,
                    userType: newSocket.userType,
                    isAdminUser: newSocket.isAdminUser
                });
            }
        }
    },

    async notifyAdmin(data) {
        let socketData = await this.getAdminSockets('notifyAdmin');
        if (!socketData || !socketData.length) {
            return true;
        }
        for (let newSocket of socketData) {
            try {
                if (!newSocket || !newSocket.id) {
                    continue;
                }
                let socket = sails.sockets.get(newSocket.id);
                if (!socket || !socket.id) {
                    await UserService.logSocketId({
                        socketId: newSocket.id,
                        connect: false,
                        userId: newSocket.userId,
                        deviceId: newSocket.deviceId,
                        userType: newSocket.userType,
                        isAdminUser: newSocket.isAdminUser
                    });

                    return true;
                }
                let responseData = {
                    flag: true,
                    message: 'Notification received.',
                    data: data
                };
                socket.emit('notificationUpdate', responseData);
                // let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
                // await SocketLog.create({
                //     event: 'notificationUpdate',
                //     remark: sails.config.SOCKET.LOG_TYPE.EVENT_EMIT,
                //     userId: userId,
                //     data: data
                // });
            } catch (error) {
                console.log('Socket disconnect: error', error);
                await UserService.logSocketId({
                    socketId: newSocket.id,
                    connect: false,
                    userId: newSocket.userId,
                    deviceId: newSocket.deviceId,
                    userType: newSocket.userType,
                    isAdminUser: newSocket.isAdminUser
                });
            }
        }
    },

    async sendNotificationCountUpdate(data) {
        let socketData = await this.getAdminSockets('sendNotificationCountUpdate');
        if (!socketData || !socketData.length) {
            return true;
        }
        for (let newSocket of socketData) {
            try {
                if (!newSocket || !newSocket.id) {
                    continue;
                }
                let socket = sails.sockets.get(newSocket.id);
                if (!socket || !socket.id) {
                    await UserService.logSocketId({
                        socketId: newSocket.id,
                        connect: false,
                        userId: newSocket.userId,
                        deviceId: newSocket.deviceId,
                        userType: newSocket.userType,
                        isAdminUser: newSocket.isAdminUser
                    });

                    return true;
                }
                let responseData = {
                    flag: true,
                    message: 'Notification update.',
                    data: data
                };
                socket.emit('adminNotificationCount', responseData);
                // let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
                // await SocketLog.create({
                //     event: 'adminNotificationCount',
                //     remark: sails.config.SOCKET.LOG_TYPE.EVENT_EMIT,
                //     userId: userId,
                //     data: data
                // });
            } catch (error) {
                console.log('Socket disconnect: error', error);
                await UserService.logSocketId({
                    socketId: newSocket.id,
                    connect: false,
                    userId: newSocket.userId,
                    deviceId: newSocket.deviceId,
                    userType: newSocket.userType,
                    isAdminUser: newSocket.isAdminUser
                });
            }
        }
    },

    async getVehicleData(socket) {
        try {
            let socketObj = sails.sockets.get(socket.id);
            let userId = socketObj.handshake.headers.userId;
            let userData;
            let filter = { isDeleted: false, connectionStatus: true };
            if (userId) {
                userData = await User.findOne({ id: userId }).select(['type']);
                if (sails.config.IS_FRANCHISEE_ENABLED && userData.type === sails.config.USER.TYPE.FRANCHISEE) {
                    filter.franchiseeId = userId;
                } else if (userData.type === sails.config.USER.TYPE.DEALER) {
                    filter.dealerId = userId;
                }
            }
            let message = 'Vehicle data found successfully.';
            let vehicle = await Vehicle.find(filter);
            if (!vehicle || !vehicle.length) {
                message = 'Vehicle data not Found!'
            }
            let newSocket = sails.sockets.get(socket.id);
            let page = newSocket.handshake.headers.page;
            if (page === sails.config.SOCKET_PAGE.DASHBOARD) {
                sails.io.sockets.connected[newSocket.id].emit('receiveVehicleData', {
                    flag: true,
                    message: message,
                    data: vehicle
                });
                // let userId = newSocket && newSocket.handshake && newSocket.handshake.headers && newSocket.handshake.headers.userId || null;
                // await SocketLog.create({
                //     event: 'receiveVehicleData',
                //     remark: sails.config.SOCKET.LOG_TYPE.EVENT_EMIT,
                //     userId: userId,
                //     data: vehicle
                // });
            }
        } catch (error) {
            console.log('locationUpdate error', error);
        }
    },

    async checkVehicleInHub(socket, data) {
        try {
            let message = 'Current Location is not available!';
            let responseData = { nestData: {}, isInNest: false };
            if (!data || !data.currentLocation) {
                socket.emit('resultIsRiderInHub', {
                    flag: true,
                    message: message,
                    data: responseData
                });
                let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
                await SocketLog.create({
                    event: 'resultIsRiderInHub',
                    remark: sails.config.SOCKET.LOG_TYPE.EVENT_EMIT,
                    userId: userId,
                    data: responseData
                });
                return true;
            }

            let matchedNest = await rideBooking.findNest(data.currentLocation);
            if (matchedNest && matchedNest.length > 0) {
                message = 'Vehicle is in the Nest.';
                responseData = { nestData: matchedNest[0], isInNest: true };
            } else {
                message = 'Vehicle is not any Nest!';
            }
            socket.emit('resultIsRiderInHub', {
                flag: true,
                message: message,
                data: responseData
            });
            let userIdOfSocket = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            await SocketLog.create({
                event: 'resultIsRiderInHub',
                remark: sails.config.SOCKET.LOG_TYPE.EVENT_EMIT,
                userId: userIdOfSocket,
                data: responseData
            });
        } catch (error) {
            console.log('locationUpdate error', error);
        }
    },

    async adminPageChange(socket, data) {
        try {
            sails.sockets.get(socket.id).handshake.headers.page = data.page;
            if (data.vehicleId) {
                sails.sockets.get(socket.id).handshake.headers.vehicleId = data.vehicleId;
            }
        } catch (error) {
            console.log('locationUpdate error', error);
        }
    },

    async getAdminNotificationCount(socket, data) {
        try {
            let notificationData = {
                count: 0
            };
            notificationData.count = await notification.getAdminNotificationCount();
            let responseData = {
                flag: true,
                message: 'Notification update.',
                data: notificationData
            };
            socket.emit('adminNotificationCount', responseData);
        } catch (error) {
            console.log('locationUpdate error', error);
        }
    },

    async addSubZones(zoneObj) {
        let subZones = [];
        if (sails.config.IS_NEST_ENABLED) {
            subZones = await Nest.find({
                zoneId: zoneObj.id,
                isDeleted: false,
                isActive: true,
            });
        }
        zoneObj.subZones = subZones;

        return zoneObj;
    },

    async taskLevelFilter(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            this.createSocketLog(
                'levelFilter',
                'EVENT_LISTEN',
                userId,
                data
            );
            let message = 'Falcon data found successfully.';
            let response = {
                flag: true,
                message: message,
                data: {}
            }
            let task = await TaskService.filterFalcon(data, userId);
            if (!task || task.data.list.length <= 0) {
                response.flag = false;
                response.message = 'Falcon not Found!'
            } else {
                response.data = task.data;
                response.message = task.message ? task.message : message;
            }
            socket.emit('levelFilterData', response);
            this.createSocketLog(
                'levelFilterData',
                'EVENT_EMIT',
                userId,
                response.data
            );
        } catch (error) {
            console.log('Socket disconnect: error', error);
            await UserService.logSocketId({
                socketId: socket.id,
                connect: false,
                userId: userId,
                deviceId: socket.deviceId,
                userType: socket.userType,
                isAdminUser: socket.isAdminUser
            });
        }
    },

    async notifyNewCreatedFalcon(task) {
        console.log("------------------Notify Feeder created new Task ------------------");
        try {
            console.log("Send newCreatedFalcon --------------------");
            let message = 'New task created.';
            let data = {
                flag: true,
                message: message,
                data: task
            }
            sails.sockets.broadcast('taskList', 'newCreatedFalcon', data);
            console.log("***************Broadcast new falcon data to all feeder***************")
            this.createSocketLog(
                'newCreatedFalcon',
                'EVENT_EMIT',
                null,
                task
            );
        } catch (error) {
            console.log('Socket disconnect: error', error);
        }
    },

    async notifyCancelTask(task) {
        console.log("----------------Notify Task is cancel----------------");
        try {
            let message = 'New task created.';
            let data = {
                flag: true,
                message: message,
                data: task
            }
            sails.sockets.broadcast('taskList', 'newCreatedFalcon', data);
            sails.sockets.broadcast('taskView', 'newCreatedFalcon', data);
            sails.sockets.broadcast('taskNavigate', 'newCreatedFalcon', data);
            console.log("**************Send cancel task successfully**************");
            this.createSocketLog(
                'newCreatedFalcon',
                'EVENT_EMIT',
                null,
                task
            );
        } catch (error) {
            console.log('Socket disconnect: error', error);
        }
    },

    async removeFalconFromMap(task, eventMessage) {
        try {
            let message = eventMessage ? eventMessage : 'Task not available.'
            let data = {
                flag: true,
                message: message,
                data: task
            }
            sails.sockets.broadcast('taskList', 'removeFalconFromMap', data);
            sails.sockets.broadcast('taskView', 'removeFalconFromMap', data);
            sails.sockets.broadcast('taskNavigate', 'removeFalconFromMap', data);
            this.createSocketLog(
                'removeFalconFromMap',
                'EVENT_EMIT',
                null,
                task
            );
        } catch (error) {
            console.log('removeFalconFromMap event: error', error);
        }
    },

    async findFalconDetail(socket, data) {
        socket = sails.sockets.get(socket.id);
        let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
        try {
            data.userId = userId;
            this.createSocketLog(
                'findFalconDetail',
                'EVENT_LISTEN',
                userId,
                data
            );
            let message = 'Falcon data found success.';
            let response = {
                flag: true,
                message: message,
                data: {}
            }
            let task = await TaskService.findFalconDetail(data);
            if (!task || !task.record) {
                response.flag = false;
                response.message = task.message ? task.message : 'Data not found!';
            } else {
                response.data = task.record ? task.record : {};
                response.message = task.message ? task.message : message;
            }
            socket.emit('sendFalconDetail', response);
            this.createSocketLog(
                'sendFalconDetail',
                'EVENT_EMIT',
                userId,
                task
            );
        } catch (error) {
            console.log('findFalconDetail error', error);
        }
    },

    async findNest(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            data.userId = userId;
            this.createSocketLog(
                'findNest',
                'EVENT_LISTEN',
                userId,
                data
            );
            let message = 'Nest found successfully.';
            let response = {
                flag: true,
                message: message,
                data: {}
            }
            let nests = await NestService.findNearestNest(data.filter, data.limit);
            if (!nests) {
                response.flag = false;
                response.message = nests.message ? nests.message : 'Nest not found!';
            } else {
                response.message = nests.message ? nests.message : message;
                response.data = nests;
            }
            console.log("nests---------------------------", nests);
            socket.emit('sendNest', response);
            this.createSocketLog(
                'sendNest',
                'EVENT_EMIT',
                userId,
                nests
            );
        } catch (error) {
            console.log('findNest error', error);
            await UserService.logSocketId({
                socketId: socket.id,
                connect: false,
                userId: userId,
                deviceId: socket.deviceId,
                userType: socket.userType,
                isAdminUser: socket.isAdminUser
            });
        }
    },

    async claimNest(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            data.userId = userId;
            this.createSocketLog(
                'claimNest',
                'EVENT_LISTEN',
                userId,
                data
            );
            let message = 'Nest claim successfully.';
            let response = {
                flag: true,
                message: message,
                data: {}
            }
            let nest = await NestService.claimNest(data);
            if (!nest || !nest.data || !nest.data.id) {
                response.flag = false;
                response.message = nest.message ? nest.message : 'Fail to claim nest!';
            } else {
                response.message = nest.message ? nest.message : message;
                response.data = nest.data ? nest.data : {}
            }
            socket.emit('sendClaimNest', response);
            this.createSocketLog(
                'sendClaimNest',
                'EVENT_EMIT',
                userId,
                nest
            );
        } catch (error) {
            console.log('findNest error', error);
            await UserService.logSocketId({
                socketId: socket.id,
                connect: false,
                userId: userId,
                deviceId: socket.deviceId,
                userType: socket.userType,
                isAdminUser: socket.isAdminUser
            });
        }
    },

    async nestAlreadyClaimed(nest) {
        try {
            let message = 'Nest claimed by other feeder.';
            let data = {
                flag: true,
                message: message,
                data: nest
            }
            sails.sockets.broadcast('nestList', 'nestAlreadyClaimed', data);
            sails.sockets.broadcast('nestView', 'nestAlreadyClaimed', data);
            sails.sockets.broadcast('nestNavigate', 'nestAlreadyClaimed', data);
            this.createSocketLog(
                'nestAlreadyClaimed',
                'EVENT_EMIT',
                null,
                nest
            );
        } catch (error) {
            console.log('Socket disconnect: error', error);
        }
    },

    async nestDetails(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            data.userId = userId;
            this.createSocketLog(
                'nestDetails',
                'EVENT_LISTEN',
                userId,
                data
            );
            let message = 'Nest details successfully found.';
            let response = {
                flag: true,
                message: message,
                data: {}
            }
            if (!data || !data.nestId) {
                response.flag = false;
                response.message = 'The request cannot be fulfilled due to bad syntax'
            }
            let nest = await Nest.findOne({ id: data.nestId, isDeleted: false });
            response.data = nest ? nest : {};
            if (!nest || !nest.id) {
                response.flag = false;
                response.message = 'Nest not found!';
            }
            socket.emit('sendNestDetails', response);
            this.createSocketLog(
                'sendNestDetails',
                'EVENT_EMIT',
                userId,
                nest
            );
        } catch (error) {
            console.log('sendNestDetails error', error);
            await UserService.logSocketId({
                socketId: socket.id,
                connect: false,
                userId: userId,
                deviceId: socket.deviceId,
                userType: socket.userType,
                isAdminUser: socket.isAdminUser
            });
        }
    },

    async cancelClaimNest(socket, data) {
        socket = sails.sockets.get(socket.id);
        let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
        try {
            data.userId = userId;
            this.createSocketLog(
                'cancelClaimNest',
                'EVENT_LISTEN',
                userId,
                data
            );
            let message = 'Cancel claimed nest successfully.';
            let response = {
                flag: true,
                message: message,
                data: {}
            }
            let nest = await NestService.cancelClaimedNest(data);
            if (!nest || !nest.data.id) {
                response.flag = false;
                response.message = nest.message ? nest.message : 'Cancel claimed nest failed!';
            }
            response.data = {};
            socket.emit('cancelClaimedNest', response);
            await this.sendCancelClaimNest(nest.data);
            this.createSocketLog(
                'cancelClaimedNest',
                'EVENT_EMIT',
                userId,
                nest
            );
        } catch (error) {
            console.log('cancelClaimedNest error', error);
            await UserService.logSocketId({
                socketId: socket.id,
                connect: false,
                userId: userId,
                deviceId: socket.deviceId,
                userType: socket.userType,
                isAdminUser: socket.isAdminUser
            });
        }
    },

    async createSocketLog(eventName, remark, userId, data) {
        try {
            let log = await SocketLog.create({
                event: eventName,
                remark: sails.config.SOCKET.LOG_TYPE[remark],
                userId: userId,
                data: data
            }).fetch();
            console.log('log--------------------', log);
        } catch (error) {
            console.log('createSocketLog error', error);
        }
    },

    async checkIsVehicleInNest(socket, data) {
        try {
            let message = 'Current Location is not available!';
            socket = sails.sockets.get(socket.id);
            let responseData = { nestData: {}, isInNest: false, isRelease: false };
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            let flag = false;
            if (!data || !data.coordinates) {
                socket.emit('resultIsVehicleInNest', {
                    flag: flag,
                    message: message,
                    data: responseData
                });
                this.createSocketLog(
                    'resultIsVehicleInNest',
                    'EVENT_EMIT',
                    userId,
                    responseData
                );
                return true;
            }
            let matchedNest = await NestService.checkVehicleInNest(data.coordinates, { isClaimedBy: userId });
            if (matchedNest) {
                message = 'Vehicle is in the Nest.';
                flag = true;
                responseData = { nestData: matchedNest, isInNest: true, isRelease: true };
            } else {
                message = 'Vehicle is not any Nest!';
            }
            socket.emit('resultIsVehicleInNest', {
                flag: flag,
                message: message,
                data: responseData
            });
            this.createSocketLog(
                'resultIsVehicleInNest',
                'EVENT_EMIT',
                userId,
                responseData
            );
        } catch (error) {
            console.log('locationUpdate error', error);
        }
    },

    async sendCancelClaimNest(nest) {
        try {
            let message = 'Nest release by other feeder.';
            let data = {
                flag: true,
                message: message,
                data: nest
            }
            sails.sockets.broadcast('nestList', 'cancelClaimedNest', data);
            sails.sockets.broadcast('nestView', 'cancelClaimedNest', data);
            sails.sockets.broadcast('nestNavigate', 'cancelClaimedNest', data);
            this.createSocketLog(
                'cancelClaimedNest',
                'EVENT_EMIT',
                null,
                nest
            );
        } catch (error) {
            console.log('Socket disconnect: error', error);
        }
    },
    /* todo for permission live update */
    async getUserSockets(userType) {
        let users = await UserService.getAllUsersOfGivenType(userType);
        // console.log('users.length :>> ', users.length);
        let socketData = [];
        _.each(users, async (user) => {

        });
        for (let user of users) {
            let socketDetails = await UtilService.getUserSocket(user.id);
            if (socketDetails) {
                socketData.push(socketDetails);
            }
        }

        return socketData;
    },

    async changePermissions(permissions, userType) {
        let socketData = await this.getUserSockets(userType);
        console.log('socketData :>> ', socketData);
        if (!socketData || !socketData.length) {
            return true;
        }
        for (let newSocket of socketData) {
            try {
                if (!newSocket || !newSocket.id) {
                    continue;
                }
                let socket = sails.sockets.get(newSocket.id);
                console.log('1111111111 :>> ', userType);

                if (!socket || !socket.id) {
                    await UserService.logSocketId({
                        socketId: newSocket.id,
                        connect: false,
                        userId: newSocket.userId,
                        deviceId: newSocket.deviceId,
                        userType: newSocket.userType,
                        isAdminUser: newSocket.isAdminUser
                    });

                    return true;
                }
                console.log('2222222222 :>> ', userType);

                let responseData = {
                    flag: true,
                    message: 'Change Permission.',
                    data: permissions
                };
                socket.emit('permissionChanged', responseData);
            } catch (error) {
                console.log('Socket disconnect: error', newSocket);
                await UserService.logSocketId({
                    socketId: newSocket.id,
                    connect: false,
                    userId: newSocket.userId,
                    deviceId: newSocket.deviceId,
                    userType: newSocket.userType,
                    isAdminUser: newSocket.isAdminUser
                });
            }
        }
    },

    async taskList(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            console.log('socket-----------------------', socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            console.log("userId--------------------", userId);
            if (data.isJoin) {
                sails.sockets.join(socket, 'taskList');
                console.log('[socket]', 'Join room :', 'taskList', data);
            }
            if (!data.isJoin) {
                sails.sockets.leave(socket, 'taskList');
                console.log('[socket]', 'leave room :', 'taskList', data);
            }
        } catch (e) {
            console.log('[error]', 'Join room taskList:', e);
        }
    },

    async taskView(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            console.log('socket-----------------------', socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            console.log("userId--------------------", userId);
            if (data.isJoin) {
                sails.sockets.join(socket, 'taskView');
                console.log('[socket]', 'Join room :', 'taskView', data);
            }
            if (!data.isJoin) {
                sails.sockets.leave(socket, 'taskView');
            }
        } catch (e) {
            console.log('[error]', 'Join room taskView:', e);
            socket.emit('error', "couldn't perform requested action");
        }
    },

    async taskNavigate(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            console.log('socket-----------------------', socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            console.log("userId--------------------", userId);
            if (data.isJoin) {
                sails.sockets.join(socket, 'taskNavigate');
                console.log('[socket]', 'Join room :', 'taskNavigate', data);
            }
            if (!data.isJoin) {
                sails.sockets.leave(socket, 'taskNavigate');
                console.log('[socket]', 'leave room :', 'taskNavigate', data);
            }
        } catch (e) {
            console.log('[error]', 'Join room taskNavigate:', e);
        }
    },

    async nestList(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            console.log('socket-----------------------', socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            console.log("userId--------------------", userId);
            if (data.isJoin) {
                sails.sockets.join(socket, 'nestList');
                console.log('[socket]', 'Join room :', 'nestList', data);
            }
            if (!data.isJoin) {
                sails.sockets.leave(socket, 'nestList');
                console.log('[socket]', 'leave room :', 'nestList', data);
            }
        } catch (e) {
            console.log('[error]', 'Join room nestList:', e);
        }
    },

    async nestView(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            console.log('socket-----------------------', socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            console.log("userId--------------------", userId);
            if (data.isJoin) {
                sails.sockets.join(socket, 'nestView');
                console.log('[socket]', 'Join room :', 'nestView', data);
            }
            if (!data.isJoin) {
                sails.sockets.leave(socket, 'nestView');
                console.log('[socket]', 'leave room :', 'nestView', data);
            }
        } catch (e) {
            console.log('[error]', 'Join room nestView:', e);
        }
    },

    async nestNavigate(socket, data) {
        try {
            socket = sails.sockets.get(socket.id);
            console.log('socket-----------------------', socket.id);
            let userId = socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.userId || null;
            console.log("userId--------------------", userId);
            if (data.isJoin) {
                sails.sockets.join(socket, 'nestNavigate');
                console.log('[socket]', 'Join room :', 'nestNavigate', data);
            }
            if (!data.isJoin) {
                sails.sockets.leave(socket, 'nestNavigate');
                console.log('[socket]', 'leave room :', 'nestNavigate', data);
            }
        } catch (e) {
            console.log('[error]', 'Join room nestNavigate:', e);
        }
    },

    async getOperationalHoursSocketData() {
        try {
            let notificationInterval = sails.config.OPERATION_HOURS_NOTIFICATION_INTERVAL;
            let currentTime = moment().toISOString();
            let expiredTime = moment(sails.config.OPERATIONAL_HOURS_CLOSE_TIME).diff(currentTime, 'minutes');
            let resData = await OperationalHoursService.operationHoursSocketDataSet();

            resData.isRemainingAlert = _.indexOf(notificationInterval, expiredTime) >= 0;
            resData.remainingTime = expiredTime;

            return resData;

        } catch (e) {
            console.log('[error]', 'get Operational Hours SocketData', e);
        }

    },

    async endTimeOperationalHours(data, socket) {
        try {
            console.log('operationHours---', data);
            console.log('socket.socketId--', socket.socketId);
            sails.sockets.get(socket.socketId).emit('operationHours', {
                flag: true,
                message: 'Operational hours end time.',
                data: data
            });

        } catch (error) {
            console.log('Operational hours end time.', error);
            await UserService.logSocketId({
                socketId: socket.id,
                connect: false,
                userId: socket.userId,
                deviceId: socket.deviceId,
                userType: socket.userType,
                isAdminUser: socket.isAdminUser
            });
        }
    }
};