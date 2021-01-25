
const moment_tz = require('moment-timezone');
const moment = require('moment');
const UtilService = require('./util');
const RedisDBService = require('./redisDB');

module.exports = {

    async setOperationalHours() {
        try {
            if (!sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                return;
            }
            let filter = { isActive: true }
            filter.dealerId = null;
            filter.franchiseeId = null;

            let operationalHours = await OperationalHours.find(filter);

            sails.config.OPERATIONAL_HOURS_CLOSE_TIME = null;
            sails.config.OPERATIONAL_HOURS_START_TIME = null;

            if (operationalHours && operationalHours.length) {
                operationalHours = _.sortBy(operationalHours, 'day');
                let timezone = sails.config.DEFAULT_TIME_ZONE;

                let day = moment_tz.tz(timezone).utc().day();
                let currentDayEndTime = _.find(operationalHours, { day: parseInt(day), isOn: true });

                if (currentDayEndTime && currentDayEndTime.endTime) {

                    let currentDate = UtilService.addTimeForCurrentDate(currentDayEndTime.endTime);
                    let formattedEndTime = moment_tz.tz(currentDate, timezone).utc().toISOString();

                    // console.log('formattedEndTime--',formattedEndTime);

                    sails.config.OPERATIONAL_HOURS_CLOSE_TIME = formattedEndTime;
                }

                let nextDay = {};
                let dayToAdd = 0;
                let startDay = parseInt(day);
                let count = 0;

                while (count <= 7) {
                    if (startDay == 6) {
                        startDay = -1;
                    }

                    dayToAdd = dayToAdd + 1;
                    startDay = startDay + 1;
                    //console.log('daysToCheck--',startDay);
                    let dayObj = _.find(operationalHours, { day: startDay, isOn: true });
                    if (dayObj && !_.isEmpty(dayObj)) {
                        nextDay = _.clone(dayObj);
                        break;
                    }
                    count++;
                }
                if (nextDay && nextDay.startTime) {
                    let currentDate = UtilService.addTimeForCurrentDate(nextDay.startTime, moment().add(dayToAdd, 'days').startOf('days').toISOString(),timezone);
                    let formattedStartTime = moment_tz.tz(currentDate, timezone).utc().toISOString();
                    // console.log('formattedStartTime--',formattedStartTime);
                    sails.config.OPERATIONAL_HOURS_START_TIME = formattedStartTime;
                }
            }


        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    },

    async operationHoursSocketDataSet(isOperationalHourClose = false) {
        try {
            let resData = { isOpened: false, message: '' };
            let operationalHours = await OperationalHours.find({ franchiseeId: null, dealerId: null, isActive: true });
            if (operationalHours && operationalHours.length) {
                let currentTime = moment().toISOString();

                let timezone = sails.config.DEFAULT_TIME_ZONE;
                // console.log('timezone',timezone);
                let day = moment_tz.tz(timezone).utc().day();

                let startDate = moment().toISOString();
                let endDate = moment().endOf('days').toISOString();

                let currentDayEndTime = _.find(operationalHours, { day: parseInt(day), isOn: true });

                if (!currentDayEndTime || !currentDayEndTime.isOn) {
                    isOperationalHourClose = true;
                } else {
                    startDate = UtilService.addTimeForCurrentDate(currentDayEndTime.startTime);
                    startDate = moment_tz.tz(startDate, timezone).utc().toISOString();
                    console.log('startDate--', startDate);

                    endDate = UtilService.addTimeForCurrentDate(currentDayEndTime.endTime);
                    endDate = moment_tz.tz(endDate, timezone).utc().toISOString();
                    console.log('endDate--', endDate);
                }

                if (moment(currentTime).isBetween(startDate, endDate)) {
                    resData.isOpened = true;
                }

                let getOffType = await this.getOffTypeFn(operationalHours);

                let nextDay = moment(sails.config.OPERATIONAL_HOURS_START_TIME).tz(timezone).day();
               
                let nextDayEndTime = _.find(operationalHours, { day: parseInt(nextDay), isOn: true });
                // make end date Time
                let endDateTime;
                if (nextDayEndTime) {
                    endDateTime = UtilService.addTimeForCurrentDate(nextDayEndTime.endTime, sails.config.OPERATIONAL_HOURS_START_TIME, timezone);
                    endDateTime = moment_tz.tz(endDateTime, timezone).utc().toISOString();
                }
                
                if (getOffType === sails.config.OPERATIONAL_HOURS_OFF_TYPE.WEEK_OFFS) {
                    resData.message = `We have closed operations.Please come back on ${moment(sails.config.OPERATIONAL_HOURS_START_TIME).tz(timezone).format('dddd,MMMM D,YYYY')} between ${moment(sails.config.OPERATIONAL_HOURS_START_TIME).tz(timezone).format("hh:mm a")} and ${moment(endDateTime).tz(timezone).format("hh:mm a")}`;
                } else if (getOffType === sails.config.OPERATIONAL_HOURS_OFF_TYPE.ROUTINE_OFF) {
                    console.log('isOperationalHourClose',isOperationalHourClose);
                    if (isOperationalHourClose) {
                        resData.message = `We have closed operations.Please come back on ${moment(sails.config.OPERATIONAL_HOURS_START_TIME).tz(timezone).format('dddd,MMMM D,YYYY')} between ${moment(sails.config.OPERATIONAL_HOURS_START_TIME).tz(timezone).format("hh:mm a")} and ${moment(endDateTime).tz(timezone).format("hh:mm a")}`;
                    }else{
                        resData.message = `Operational hours are from ${moment(startDate).tz(timezone).format("hh:mm a")} to ${moment(endDate).tz(timezone).format("hh:mm a")}. Your ride will end automatically after ${moment(endDate).tz(timezone).format("hh:mm a")}.`;
                    }
                    
                } else {
                    resData.message = `We have closed operations. We will be back soon.`;
                }
            }
            return resData;
        } catch (e) {
            console.log("OperationHoursSocketDataSet--", e);
            throw new Error(e);
        }

    },

    async getOffTypeFn(operationalHours) {
        let notAvailable = _.filter(operationalHours, { isOn: false });
        if (notAvailable && notAvailable.length == 7) {
            return sails.config.OPERATIONAL_HOURS_OFF_TYPE.NOT_AVAILABLE;
        } else {
            let allDayOn = _.filter(operationalHours, { isOn: true });
            if (allDayOn && allDayOn.length) {
                return sails.config.OPERATIONAL_HOURS_OFF_TYPE.ROUTINE_OFF;
            } else {
                return sails.config.OPERATIONAL_HOURS_CLOSE_TIME.WEEK_OFFS;
            }
        }
    },

    async operationalHoursChangeEvent(isOperationalHourClose = false) {
        try {

            let allSockets = await RedisDBService.getAllSocketData();
            if (allSockets && allSockets.length && sails.config.OPERATIONAL_HOURS_CLOSE_TIME) {
                let currentTime = moment().toISOString();
                let expiredTime = moment(sails.config.OPERATIONAL_HOURS_CLOSE_TIME).diff(currentTime, 'minutes');
                for (let socketData of allSockets) {
                    let socket = socketData && socketData[0];
                    if (socket && socket.socketId) {
                        let resData = await this.operationHoursSocketDataSet(isOperationalHourClose);

                        resData.isRemainingAlert = false;
                        resData.remainingTime = expiredTime,
                            await socketEvents.endTimeOperationalHours(resData, socket);
                    }
                }
            }

        } catch (e) {
            throw new Error(e);
        }
    },

    async checkIsOperationalHoursCLose() {
        try {
            if (!sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                return {};
            }
            let isTimeClose = false;
            let operationalHours = await OperationalHours.find({ franchiseeId: null, dealerId: null, isActive: true });
            let timezone = sails.config.DEFAULT_TIME_ZONE;


            let getOffType = await this.getOffTypeFn(operationalHours);
            if (getOffType === sails.config.OPERATIONAL_HOURS_OFF_TYPE.NOT_AVAILABLE) {
                return { isTimeClose: true };
            }

            let currentDay = moment().tz(timezone).day();
            let currentDayData = _.find(operationalHours, { day: parseInt(currentDay) });
            let currentDayStartTime = UtilService.addTimeForCurrentDate(currentDayData.startTime);
            currentDayStartTime = moment_tz.tz(currentDayStartTime, timezone).utc().toISOString();

            let currentDayEndTime = UtilService.addTimeForCurrentDate(currentDayData.endTime);
            currentDayEndTime = moment_tz.tz(currentDayEndTime, timezone).utc().toISOString();

            if (!sails.config.OPERATIONAL_HOURS_CLOSE_TIME) {
                if (!currentDayData || !currentDayData.isOn) {
                    sails.config.OPERATIONAL_HOURS_CLOSE_TIME = moment().startOf('days').toISOString();
                } else {
                    let endDateTime = UtilService.addTimeForCurrentDate(currentDayData.endDateTime);
                    sails.config.OPERATIONAL_HOURS_CLOSE_TIME = moment_tz.tz(endDateTime, timezone).utc().toISOString();
                }
            }

            let nextDay = moment(sails.config.OPERATIONAL_HOURS_START_TIME).tz(timezone).day();
            //console.log('OPERATIONAL_HOURS_START_TIME---',sails.config.OPERATIONAL_HOURS_START_TIME, nextDay, moment(sails.config.OPERATIONAL_HOURS_START_TIME).tz(timezone).day());
            let nextDayEndTime = _.find(operationalHours, { day: parseInt(nextDay), isOn: true });
            //console.log('nextDayEndTime', nextDayEndTime);

            let endDateTime = UtilService.addTimeForCurrentDate(nextDayEndTime.endTime, sails.config.OPERATIONAL_HOURS_START_TIME,timezone);
            endDateTime = moment_tz.tz(endDateTime, timezone).utc().toISOString();

            let previousDay = currentDay === 6 ? 0 : currentDay - 1;
            let previousDayData = _.find(operationalHours, { day: parseInt(previousDay) });

            let previousDayEndDateTime = UtilService.addTimeForCurrentDate(previousDayData.endTime, moment().subtract(1, 'days').startOf('days').toISOString(),timezone);
            previousDayEndDateTime = moment_tz.tz(previousDayEndDateTime, timezone).utc().toISOString();

            if (sails.config.IS_OPERATIONAL_HOUR_ENABLE) {
                if (sails.config.OPERATIONAL_HOURS_CLOSE_TIME && sails.config.OPERATIONAL_HOURS_START_TIME) {
                    isTimeClose = UtilService.checkTimeBetweenDate(previousDayEndDateTime, currentDayStartTime);
                    if (isTimeClose) {
                        return { isTimeClose, startDateTime: currentDayStartTime, endDateTime: currentDayEndTime };
                    }

                    isTimeClose = UtilService.checkTimeBetweenDate(sails.config.OPERATIONAL_HOURS_CLOSE_TIME, sails.config.OPERATIONAL_HOURS_START_TIME)
                }
            }

            return { isTimeClose, startDateTime: sails.config.OPERATIONAL_HOURS_START_TIME, endDateTime };
        } catch (e) {
            throw new Error(e);
        }
    }
}