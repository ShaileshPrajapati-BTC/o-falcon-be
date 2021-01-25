
let moment_tz = require('moment-timezone');

module.exports = {

    async getCurrentDateHours(req, res) {
        try {
          
            let timezone = sails.config.DEFAULT_TIME_ZONE;
            let day = moment_tz.tz(timezone).utc().day();

            // find record
            let record = await OperationalHours.findOne({ day: day , isActive:true})
                .populate('franchiseeId', { select: ['firstName', 'lastName', 'name'] })
                .populate('dealerId', { select: ['firstName', 'lastName', 'name'] });
            // return record
            if (record && record.id) {
                return res.ok(record, sails.config.message.OK);
            }
            return res.ok({}, sails.config.message.OPERATIONAL_RECORD_NOT_FOUND);
        } catch (error) {
            console.log(error);

            return res.serverError(null, error);
        }
    },

}