const request = require('request');
module.exports = {
    googleDirection: async (req, res) => {
        try {
            const fields = [
                'origin',
                'destination',
                'mode'
            ];
            let params = req.allParams();
            commonValidator.checkRequiredParams(fields, params);
            let origin = params.origin;
            let destination = params.destination;
            const mode = params.mode;
            if (!origin.includes(',')) {
                origin = `place_id:${origin}`;
                destination = `place_id:${destination}`;
            }
            const googleApiKey = sails.config.GOOGLE_API_KEY;
            const baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
            const url = `${baseUrl}?origin=${origin}&destination=${destination}&mode=${mode}&key=${googleApiKey}`;
            let response = await new Promise((resolve, reject) => {
                const options = {
                    url: url,
                    method: 'get'
                };

                request(options, (error, response, body) => {
                    resolve(body);
                });
            });
            response = JSON.parse(response);

            return res.ok(response, sails.config.message.OK);
        } catch (error) {
            console.log(error);
            res.serverError({}, error);
        }
    }
};
