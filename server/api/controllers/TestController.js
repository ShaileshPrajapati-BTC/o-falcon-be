/**
 * TestController
 *
 * @description :: Server-side logic for managing tests
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    async test(req, res) {

    },
    callbackTest: async function (req, res) {
        let params = req.allParams();

        try {
            let data = await req.body;

            // console.log('IoT callback data: ', data);
            // console.log('IoT callback params: ', params);

            let dataSet = {
                data: data ? data : null
            }
            let callbackLog = await IOTCallbackLog.create(dataSet).fetch();

            // console.log('IoT callbackLog: ', callbackLog);
            let response = {
                data: data,
                log: callbackLog
            };

            return res.ok(response);
        } catch (err) {
            console.log('IoT callback err: ', err);
            return res.serverError(null, err);
        }
    },
};

