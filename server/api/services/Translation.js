const fs = require('fs');

module.exports = {
    translateData(data, language = '', modelName = '') {
        if (!language) {
            return data;
        }
        let isObject = false;
        if (!_.isArray(data)) {
            isObject = true;
            data = [data];
        }
        for (let record of data) {
            if (record.multiLanguageData && record.multiLanguageData[language]) {
                for (let field in record.multiLanguageData[language]) {
                    if (record.multiLanguageData[language][field] &&
                        record.multiLanguageData[language][field].length > 0
                    ) {
                        record[field] = record.multiLanguageData[language][field];
                    }
                }
            }

            if (modelName) {
                let modelFields = sails.config.MODEL_MULTI_LANGUAGE_FIELDS[modelName.toLowerCase()].modelFields;
                if (modelFields) {
                    for (let modelField of modelFields) {
                        if (record[modelField] &&
                            record[modelField].multiLanguageData &&
                            record[modelField].multiLanguageData[language]
                        ) {
                            for (let modelKey in record[modelField].multiLanguageData[language]) {
                                if (!record[modelField].multiLanguageData[language][modelKey]) {
                                    continue;
                                }
                                record[modelField][modelKey] = record[modelField].multiLanguageData[language][modelKey];
                            }
                        }
                    }
                }
            }
        }

        if (isObject) {
            return data[0];
        }

        return data;
    },

    translateMessage(message, language, type) {
        let newMessage = ''
        let typeOfVehicle = type ? sails.config.VEHICLE_TYPE_STRING[type] : "Vehicle";

        if (!language) {
            // message = message.replace("%@", typeOfVehicle);
            message = message.split('%@').join(typeOfVehicle);
            return message;
        }
        const filePath = `${sails.config.appPath}/config/locales/${language}.json`;
        try {
            if (!fs.existsSync(filePath)) {
                message = message.split('%@').join(typeOfVehicle);

                return message;
            }
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            newMessage = data[message];
            if (newMessage) {
                let tranlatedMessage = data[message];
                let word = data[typeOfVehicle];
                message = tranlatedMessage.split('%@').join(word);
            } else {
                message = message.split('%@').join(typeOfVehicle);
            }

            return message;
        } catch (error) {
            console.log('error', error);

            return message;
        }
    },

};
