let Singleton = (() => {
    let instance;
    let createInstance = async () => {
        if (sails.config.STRIPE_SECRET_KEY) {
            instance = await require('stripe')(sails.config.STRIPE_SECRET_KEY);
        }
    };

    let setNewInstance = async () => {
        instance = undefined;
        if (sails.config.STRIPE_SECRET_KEY) {
            instance = await require('stripe')(sails.config.STRIPE_SECRET_KEY);
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
    async getStripeObject() {
        try {
            let stripe = await Singleton.getInstance();
            console.log("stripe ---- ", stripe ? "stripe object exist": "stripe object not exist");

            return stripe;
        } catch (e) {
            throw new Error(e);
        }
    },

    async setStripeNewInstance() {
        try {
            await Singleton.setNewInstance();
        } catch (e) {
            throw new Error(e);
        }
    }
};
