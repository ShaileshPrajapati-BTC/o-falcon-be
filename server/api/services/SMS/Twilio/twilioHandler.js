let Singleton = (() => {
    let instance;
    let createInstance = async () => {
        if (sails.config.TWILIO_ACCOUNT_SID && sails.config.TWILIO_AUTH_TOKEN) {
            instance = await require('twilio')(sails.config.TWILIO_ACCOUNT_SID, sails.config.TWILIO_AUTH_TOKEN);
        }
    };

    let setNewInstance = async () => {
        instance = undefined;
        if (sails.config.TWILIO_ACCOUNT_SID && sails.config.TWILIO_AUTH_TOKEN) {
            instance = await require('twilio')(sails.config.TWILIO_ACCOUNT_SID, sails.config.TWILIO_AUTH_TOKEN);
        }
    };

    return {
        getInstance: async () => {
            if (!instance) {
                await createInstance();
            }

            return instance;
        },
        setNewInstance: async () => {
            await setNewInstance();
        }
    };
})();

module.exports = {
    async getTwilioObject() {
        try {
            console.log(sails.config.TWILIO_ACCOUNT_SID)
            let twilio = await Singleton.getInstance();
            console.log("twilio ---- ", twilio ? "twilio object exist": "twilio object not exist");

            return twilio;
        } catch (e) {
            throw new Error(e);
        }
    },

    async setTwilioNewInstance() {
        try {
            await Singleton.setNewInstance();
        } catch (e) {
            throw new Error(e);
        }
    }
};
