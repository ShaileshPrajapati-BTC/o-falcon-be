const crypto = require('crypto');
const request = require('request');
var fs = require('fs');

module.exports = {
    /**
    * Encrypt data using AES Cipher (CBC) with 128 bit key
    *
    * @param type workingKey -password shared by AuthBridge
    * @param type iv - initialization vector
    * @param type plainText - data to encrypt
    * @return encrypted data in base64 encoding
    */
    async encrypt(plainText, pass) {
        var iv = crypto.randomBytes(16);
        const hash = crypto.createHash('sha512');
        const dataKey = hash.update(pass, 'utf-8');
        const genHash = dataKey.digest('hex');
        const key = genHash.substring(0, 16);
        const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), iv);
        let requestData = cipher.update(plainText, 'utf-8', 'base64');
        requestData += cipher.final('base64') + ":" + new Buffer(iv).toString('base64');
        return requestData;
    },
    /**
    * Decrypt data using AES Cipher (CBC) with 128 bit key
    *
    * @param type workingkey - password shared by AuthBridge
    * @param type encText - data to be decrypted in base64 encoding
    * @return decrypted data
    */
    async decrypt(encText, pass) {
        var m = crypto.createHash('sha512');
        var datakey = m.update(pass, 'utf-8');
        var genHash = datakey.digest('hex');
        var key = genHash.substring(0, 16);
        var result = encText.split(":");
        var iv = Buffer.from(result[1], 'base64');
        var decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key), iv);
        var decoded = decipher.update(result[0], 'base64', 'utf8');
        decoded += decipher.final('utf8');
        return decoded;
    },

    async verifyDrivingLicenceNumber(params, kycVerificationFeatureActive) {
        console.log("params-------------------", params);
        if (!kycVerificationFeatureActive) {
            return true;
        }
        let password = sails.config.KYC_PASSWORD;
        let requestData = { transID: "", docType: 4, docNumber: params.number, dob: params.dob, dl_photo: 0 }
        console.log(requestData);
        requestData = JSON.stringify(requestData);
        let encryptData = await this.encrypt(requestData, password);
        let url = `${sails.config.KYC_ENDPOINT_URL}/api/v2.2/idsearch`;
        let data = { "requestData": encryptData }
        console.log("data-----------------------------------", data);
        let method = 'POST';
        try {
            let response = await new Promise((resolve, reject) => {
                const options = {
                    url: url,
                    method: method,
                    headers: {
                        "username": sails.config.KYC_USERNAME,
                        "Content-Type": "application/json"
                    },
                    body: data,
                    json: true,
                    timeout: 10000,
                    followRedirect: true,
                    maxRedirects: 10
                };
                request(options, (error, response, body) => {
                    console.log("error------------------------", error);
                    resolve(body);
                });
            });
            console.log('-----------------Verify document using KYC -----------------');
            console.log(response);
            if (!response || !response.responseData) {
                return false;
            }
            let decryptData = await this.decrypt(response.responseData, password);
            response = JSON.parse(decryptData);
            console.log(response);

            return response;
        } catch (error) {
            console.log('error', error);
            throw error;
        }

    },

    // function to encode file data to base64 encoded string
    async base64_encode(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer(bitmap).toString('base64');
    },

    async verifyDocumentImage(params, kycVerificationFeatureActive) {
        if (!kycVerificationFeatureActive) {
            return true;
        }
        let password = sails.config.KYC_PASSWORD;
        let filePath = `${sails.config.appPath}/assets/`;
        let frontImage = await this.base64_encode(filePath + params.path);
        let backImage = await this.base64_encode(filePath + params.backPath);
        let requestData = { transID: "", docType: 4, front_image: frontImage, back_image: backImage }
        requestData = JSON.stringify(requestData);
        let encryptData = await this.encrypt(requestData, password);
        let url = `${sails.config.KYC_ENDPOINT_URL}/api/v2.2/ocr`;
        let data = { "requestData": encryptData }
        let method = 'POST';
        try {
            let response = await new Promise((resolve, reject) => {
                const options = {
                    url: url,
                    method: method,
                    headers: {
                        "username": sails.config.KYC_USERNAME,
                        "Content-Type": "application/json"
                    },
                    body: data,
                    json: true,
                    // timeout: 10000,
                    followRedirect: true,
                    maxRedirects: 10
                };
                request(options, (error, response, body) => {
                    console.log("error------------------------", error);
                    resolve(body);
                });
            });
            console.log('----------------- Verify image document using KYC -----------------');
            console.log(response);
            if (!response || !response.responseData
                && response.status === sails.config.KYC.STATUS.FAILED_VERIFY
            ) {
                return false;
            }
            if (!response || !response.responseData) {
                return false;
            }
            let decryptData = await this.decrypt(response.responseData, password);
            response = JSON.parse(decryptData);

            return response;
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    },

    async faceAPIToken(userId) {
        let password = sails.config.KYC_PASSWORD;
        const formData = { transID: userId, docType: 201 }
        console.log('formData--------------------------', formData);
        let url = `${sails.config.KYC_ENDPOINT_URL}/api/v2.2/faceapi/token`;
        let method = 'POST';
        try {
            let response = await new Promise((resolve, reject) => {
                const options = {
                    url: url,
                    method: method,
                    headers: {
                        "username": sails.config.KYC_USERNAME
                    },
                    formData: formData,
                    json: true,
                    timeout: 10000,
                    followRedirect: true,
                    maxRedirects: 10
                };
                request(options, (error, response, body) => {
                    console.log("error------------------------", error);
                    resolve(body);
                });
            });
            console.log('----------------- Generate face API token using KYC -----------------');
            console.log(response);
            if (!response || !response.responseData
                && response.status === sails.config.KYC.STATUS.FAILED_VERIFY
            ) {
                return false;
            }
            if (!response || !response.responseData) {
                return false;
            }
            let decryptData = await this.decrypt(response.responseData, password);
            response = JSON.parse(decryptData);

            return response;
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    },

    async faceVerification(params, kycVerificationFeatureActive) {
        if (!kycVerificationFeatureActive) {
            return true;
        }
        console.log('sails.config.KYC_USERNAME----------------', sails.config.KYC_USERNAME);
        let password = sails.config.KYC_PASSWORD;
        console.log('sails.config.KYC_PASSWORD----------------', password);
        let secretTokenData = await this.faceAPIToken(params.userId);
        if (!secretTokenData || secretTokenData.status === 0 || secretTokenData.status !== 1) {
            return false;
        }
        let filePath = `${sails.config.appPath}/assets/`;
        let encryptData = await this.encrypt(secretTokenData.msg.secretToken, password);
        let requestData = {
            tsTransID: secretTokenData.msg.tsTransID,
            secretToken: encryptData,
            image: fs.createReadStream(filePath + params.selfie),
            document: fs.createReadStream(filePath + params.path)
        };
        let url = `${sails.config.KYC_ENDPOINT_URL}/api/v2.2/faceapi/verify`;
        // console.log('Request selfie verification--------------------------', requestData);
        let method = 'POST';
        try {
            let response = await new Promise((resolve, reject) => {
                const options = {
                    url: url,
                    method: method,
                    headers: {
                        "username": sails.config.KYC_USERNAME
                    },
                    formData: requestData,
                    json: true,
                    // timeout: 10000,
                    followRedirect: true,
                    maxRedirects: 10
                };
                request(options, (error, response, body) => {
                    console.log("error------------------------", error);
                    resolve(body);
                });
            });
            console.log('----------------- Verify user selfie using KYC -----------------');
            console.log(response);
            if (!response || !response.responseData
                && response.status === sails.config.KYC.STATUS.FAILED_VERIFY
            ) {
                return false;
            }
            if (!response || !response.responseData) {
                return false;
            }
            let decryptData = await this.decrypt(response.responseData, password);
            response = JSON.parse(decryptData);

            return response;
        } catch (error) {
            console.log('error', error);
            throw error;
        }
    }
}