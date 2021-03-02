const modelName = 'OperationalHours';
const moment_tz = require('moment-timezone');
const moment = require('moment');
const OperationalHoursService = require('../../services/operationalHours');
const UtilService = require('../../services/util');

module.exports = {

    async upsert(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            let timezone = sails.config.DEFAULT_TIME_ZONE;
            let day = moment_tz.tz(timezone).utc().day();
        
            if (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE) {
                params.franchiseeId = loggedInUser.id;
            }
            if (loggedInUser.type === sails.config.USER.TYPE.DEALER) {
                params.dealerId = loggedInUser.id;
            }

            if ((!sails.config.IS_FRANCHISEE_ENABLED && params.franchiseeId) || params.franchiseeId == '') {
                delete params.franchiseeId;
            }
            let option = {
                params: params,
                modelName: modelName
            };

            let response;
            let message;


            if (params.id) {
                await commonValidator.validateUpdateParams(option);
                response = await OperationalHours.update({ id: params.id }, params).fetch();
                response = response[0];
                message = sails.config.message.OPERATIONAL_UPDATED;
            } else {
                // check old entry exists then deactive it and creat new record;
                let checkFilter = {
                    day: params.day,
                    dayName: params.dayName,
                }
                checkFilter.dealerId = null;
                checkFilter.franchiseeId = null;

                // if (params.franchiseeId) {
                //     checkFilter.franchiseeId = params.franchiseeId;
                // }
                // if (params.dealerId) {
                //     checkFilter.franchiseeId = params.franchiseeId;
                // }

                if (params.isDateChanged) {
                    await OperationalHours.update(checkFilter, { isActive: false });

                    await commonValidator.validateCreateParams(option);
                    response = await OperationalHours.create(params).fetch();

                    if(params.isOn && params.day == day ){
                      // start operation
                      // check if time is not closed then active scooter
                      let endDateTime = UtilService.addTimeForCurrentDate(params.endTime, moment().tz(timezone).toISOString(), timezone);
                      endDateTime = moment_tz.tz(endDateTime, timezone).utc().toISOString();
                      console.log('endDateTime',endDateTime);
                      if(moment().isBefore(endDateTime)){
                        await Vehicle.update({},{isActive : true});
                      }
                         
                    }else if(!params.isOn && params.day == day ){
                        // stop operational hours 
                        await Vehicle.update({},{isActive : false});
                        await rideBooking.stopeRideOnDeActiveVehicle();    
                    }
                   
                } else {

                    response = await OperationalHours.findOne(checkFilter);
                    console.log('response', response);
                    if (!response || !response.id) {
                        await commonValidator.validateCreateParams(option);
                        response = await OperationalHours.create(params).fetch();
                    }
                }

                message = sails.config.message.OPERATIONAL_CREATED;
            }

            await OperationalHoursService.setOperationalHours();
            await OperationalHoursService.operationalHoursChangeEvent();
    
            return res.ok(response, message);

        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async view(req, res) {
        try {
            let params = req.allParams();
            // get filter
            if (!params.id) {
                return res.badRequest(null, sails.config.message.BAD_REQUEST);
            }

            // find record
            let record = await OperationalHours.findOne({ id: params.id })
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name'] });
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK, modelName);
            }
            return res.ok({}, sails.config.message.OPERATIONAL_RECORD_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

    async getAllActiveOperationalHours(req, res) {
        try {
            let params = req.allParams();
            let loggedInUser = req.user;
            // find record
            let filter = { isActive: true };
            filter.dealerId = null;
            filter.franchiseeId = null;
            // if (loggedInUser.type === sails.config.USER.TYPE.FRANCHISEE) {
            //     filter.franchiseeId = loggedInUser.id;
            // }
            // if (loggedInUser.type === sails.config.USER.TYPE.DEALER) {
            //     filter.dealerId = loggedInUser.id;
            // }
            let data = await OperationalHours.find(filter)
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name'] });

            if (!data || !data.length) {
                // seed data
                let dataToSeed = [
                    {
                        "day": 6,
                        "dayName": "Saturday",
                        "startTime": "00:01",
                        "endTime": "23:57",
                        "isOn": true
                    }, {
                        "day": 5,
                        "dayName": "Friday",
                        "startTime": "00:01",
                        "endTime": "23:57",
                        "isOn": true
                    },
                    {
                        "day": 4,
                        "dayName": "Thursday",
                        "startTime": "00:01",
                        "endTime": "23:57",
                        "isOn": true
                    },
                    {
                        "day": 3,
                        "dayName": "Wednesday",
                        "startTime": "00:01",
                        "endTime": "23:57",
                        "isOn": true
                    },
                    {
                        "day": 2,
                        "dayName": "Tuesday",
                        "startTime": "00:01",
                        "endTime": "23:57",
                        "isOn": true
                    },
                    {
                        "day": 1,
                        "dayName": "Monday",
                        "startTime": "00:01",
                        "endTime": "23:57",
                        "isOn": true
                    },
                    {
                        "day": 0,
                        "dayName": "Sunday",
                        "startTime": "00:01",
                        "endTime": "23:57",
                        "isOn": true
                    }
                ];

                let createdRecord = await OperationalHours.createEach(dataToSeed).fetch();
                data = createdRecord.newRecords;
            }
            return res.ok(data, sails.config.message.OK);


        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    }
}