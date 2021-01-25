let Singleton = (() => {
    let instance;
    let createInstance = async () => {
        const redis = require("redis");
        instance = redis.createClient();

        instance.on("error", function (error) {
            console.error(error);
        });
    };

    let setNewInstance = async () => {
        instance = undefined;
        const redis = require("redis");
        instance = redis.createClient();

        instance.on("error", function (error) {
            console.error(error);
        });
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
    async getRedisClient() {
        try {
            let client = await Singleton.getInstance();
            // console.log("client ---- ", client ? "client object exist" : "client object not exist");

            return client;
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
    },

    async getData(key) {
        try {
            let client = await this.getRedisClient();
            let data = await new Promise((resolve, reject) => {
                client.get(key, function (err, reply) {
                    if (err) {
                        // console.log('getDataFromRedis err', err);
                        reject(err);
                    }
                    // console.log('getDataFromRedis ', reply);
                    resolve(reply);
                });
            });
            data = JSON.parse(data);

            return data;
        } catch (e) {
            throw new Error(e);
        }
    },

    async setData(key, data) {
        try {
            let client = await this.getRedisClient();
            data = JSON.stringify(data);
            let result = await new Promise((resolve, reject) => {
                client.set(key, data, function (err, reply) {
                    if (err) {
                        // console.log('setDataToRedis err', err);
                        reject(false);
                    }
                    // console.log('setDataToRedis reply', reply);
                    resolve(true);
                });
            });

            return result;
        } catch (e) {
            throw new Error(e);
        }
    },

    async removeKey(key) {
        try {
            let client = await this.getRedisClient();
            let result = await new Promise((resolve, reject) => {
                client.del(key, function (err, reply) {
                    if (err) {
                        // console.log('setDataToRedis err', err);
                        reject(false);
                    }
                    // console.log('setDataToRedis reply', reply);
                    resolve(true);
                });
            });

            return result;
        } catch (e) {
            throw new Error(e);
        }
    },

    async resetDB() {
        try {
            let client = await this.getRedisClient();
            // add key prefix for saving data
            let dataToReSaveAfterClean = ['ride'];
            let data = {};
            for (let prefixWord of dataToReSaveAfterClean) {
                data[prefixWord] = await this.getAllDataWithKey(prefixWord);
            }
            let result = await new Promise((resolve, reject) => {
                client.flushdb(function (err, reply) {
                    if (err) {
                        console.log('flushdb err', err);
                        reject(false);
                    }
                    console.log('flushdb reply', reply);
                    resolve(true);
                });
            });

            for (let prefixWord of dataToReSaveAfterClean) {
                console.log('data[prefixWord]', data[prefixWord]);
                for (let k in data[prefixWord]) {
                    await this.setData(k, data[prefixWord][k]);
                }
            }


            return result;
        } catch (e) {
            throw new Error(e);
        }
    },

    async getAllKeysWithPrefix(keyPrefix) {
        try {
            let client = await this.getRedisClient();
            let data = await new Promise((resolve, reject) => {
                client.keys(`*${keyPrefix}*`, function (err, reply) {
                    if (err) {
                        console.log('getDataFromRedis err', err);
                        reject(err);
                    }
                    console.log('getDataFromRedis ', reply);
                    resolve(reply);
                });
            });


            return data;
        } catch (e) {
            throw new Error(e);
        }
    },

    async getAllDataWithKey(prefix) {
        let allData = {};
        let keys = await this.getAllKeysWithPrefix(prefix);
        for (let key of keys) {
            let data = await this.getData(key);
            if (data) {
                allData[key] = data;
            }
        }

        return allData;
    },

    async getAllData(prefix) {
        let keys = await this.getAllKeysWithPrefix(prefix);
        let allData = [];
        for (let key of keys) {
            let data = await this.getData(key);

            if (data) {
                allData.push(data);
            }
        }
        return allData;
    },

    async getAllSocketData() {
        let allData = await this.getAllData('socket');

        return allData;
    }
};