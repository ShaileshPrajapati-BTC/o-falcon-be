'use strict';
const _ = require('lodash');
const iplocation = require('iplocation').default;
const moment = require('moment');
const RedisDBService = require('./redisDB');

module.exports = {
    /**
     * @description generate slug from string
     * @param text
     * @return {string}
     */
    slugify: (text) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, '');
    },
    randomString(strLength) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZ123456abcdefghiklmnopqrstuvwxyz';
        let string_length = strLength || 8;
        let randomstring = '';
        let charCount = 0;
        let numCount = 0;

        for (let i = 0; i < string_length; i++) {
            // If random bit is 0, there are less than 3 digits already saved, and there are not already 5 characters saved, generate a numeric value.
            if (
                (Math.floor(Math.random() * 2) == 0 && numCount < 3) ||
                charCount >= 5
            ) {
                let rnum = Math.floor(Math.random() * 10);
                randomstring += rnum;
                numCount += 1;
            } else {
                // If any of the above criteria fail, go ahead and generate an alpha character from the chars string
                let rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
                charCount += 1;
            }
        }

        return randomstring;
    },

    /**
     * @description: humanize string into readable format
     * @param str
     */
    humanize: (str) => {
        return str
            .replace(/^[\s_]+|[\s_]+$/g, '')
            .replace(/[_\s]+/g, ' ')
            .replace(/^[a-z]/, (m) => {
                return m.toUpperCase();
            });
    },
    /**
     * Merge multiple objects into one
     * @param roles
     * @returns {*}
     */
    mergeObjects: function (roles) {
        // Custom merge function ORs together non-object values, recursively
        // calls itself on Objects.
        let merger = function (a, b) {
            if (_.isObject(a)) {
                return _.merge({}, a, b, merger);
            }

            return a || b;

        };

        // Allow roles to be passed to _.merge as an array of arbitrary length
        let args = _.flatten([{}, roles, merger]);

        return _.merge.apply(_, args);
    },
    /**
     * @description getting base URL of project
     * @return {string}
     */
    getBaseUrl: () => {
        if (sails.config.custom && sails.config.custom.baseUrl) {
            return sails.config.custom.baseUrl;
        }
        let usingSSL =
            sails.config.ssl && sails.config.ssl.key && sails.config.ssl.cert;
        let port = sails.config.proxyPort || sails.config.port;
        let domain = '';
        let interfaces = require('os').networkInterfaces();
        for (let devName in interfaces) {
            let iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                let alias = iface[i];
                if (
                    alias.family === 'IPv4' &&
                    alias.address !== '127.0.0.1' &&
                    !alias.internal
                ) {
                    domain = alias.address;
                }
            }
        }
        let localAppURL =
            `${usingSSL ? 'https' : 'http'
            }://${domain
            }${port == 80 || port == 443 ? '' : `:${port}`}`;

        return localAppURL;
    },
    randomNumber: (length = 4) => {
        let numbers = '12345678901234567890';
        let result = '';
        for (let i = length; i > 0; --i) {
            result += numbers[Math.round(Math.random() * (numbers.length - 1))];
        }

        return result;
    },
    getPrimaryEmail(emails) {
        if (emails && _.size(emails) > 0) {
            let email = _.find(emails, (email) => {
                return email.isPrimary;
            });

            return email && email.email ? email.email : '';
        }

        return '';
    },

    /**
     * @function generateModelLocalId
     * @description generate local id based on model specified
     * @param options => "{
     *                      "parentId":<string>
     *                   }"
     * @param callback
     */
    generateModelLocalId: function (options, callback) {
        let self = this;
        let Model;
        if (_.isObject(options.model)) {
            Model = options.model;
        } else {
            Model = sails.models[options.model];
        }
        let params = {};
        async.waterfall([
            // get parent location
            function (wcb) {
                let filter = {};
                if (options.parentId) {
                    filter = {
                        where: {
                            id: options.parentId
                        }
                    };
                } else {
                    filter = {
                        where: {
                            parentId: null
                        }
                    };
                }
                filter.sort = 'localIdSequence DESC';
                filter.limit = 1;
                Model.find(filter).exec((err, parents) => {
                    if (err) {
                        callback(err);
                    }

                    if (parents && parents.length) {
                        let parent = parents[0];
                        // set parent local id
                        if (options.parentId) {
                            params.parentLocalId = parent.localId;
                        }
                        wcb(null, parent);
                    } else {
                        wcb(null, undefined);
                    }
                });
            },

            // generate local id
            function (parent, wcb) {
                if (options.parentId && parent) {
                    // find last group sequence record for generate next localId
                    let filter = {
                        where: {
                            parentLocalId: parent.localId
                        }
                    };
                    filter.sort = 'localIdSequence DESC';
                    filter.limit = 1;
                    Model.find(filter).exec((err, lastGroupSequenceRecords) => {
                        if (err) {
                            callback(err);
                        }

                        // if last record available generate local id after that
                        if (lastGroupSequenceRecords && lastGroupSequenceRecords.length) {
                            let lastGroupSequenceRecord = lastGroupSequenceRecords[0];
                            var localOptions = {};
                            localOptions.lastLocalId = parent.localId;
                            localOptions.lastSeqNum = lastGroupSequenceRecord.localIdSequence;
                            localOptions.onlyAlphabet = false; // set alphabet false , due to local id available
                            params.localIdSequence =
                                lastGroupSequenceRecord.localIdSequence + 1;
                            params.lastSeqNum = lastGroupSequenceRecord.localIdSequence + 1; // set last sequence + 1
                            params.localId = self.generateLocalId(localOptions); // generate local id
                            callback(null, params);
                        }
                        // if not available last record , then generate local id based on parent
                        else {
                            var localOptions = {};
                            localOptions.lastLocalId = parent.localId; // set local id of parent
                            localOptions.lastSeqNum = 0; // set last sequence as zero
                            localOptions.onlyAlphabet = false; // set alphabet false , due to local id available
                            params.localIdSequence = 1; // and next sequence as one plus last sequence
                            params.lastSeqNum = 1;
                            params.localId = self.generateLocalId(localOptions);
                            callback(null, params);
                        }
                    });
                }
                // if parent id not available in request, generate new local id
                else {
                    let localOptions = {};
                    localOptions.lastLocalId =
                        parent && parent.localId ? parent.localId : '';
                    localOptions.lastSeqNum =
                        parent && parent.localIdSequence ? parent.localIdSequence || 0 : 0;
                    localOptions.onlyAlphabet = !(parent && options.parentId); // if parent id available in req. set alphabet true, otherwise false
                    params.localIdSequence =
                        parent && parent.localIdSequence ?
                            (parent.localIdSequence || 0) + 1 :
                            1; // if local id sequence available ,increment
                    params.lastSeqNum = localOptions.lastSeqNum;
                    params.localId = self.generateLocalId(localOptions);
                    callback(null, params);
                }
            }
        ]);
    },

    /**
     * Alphabet auto generate sequence array
     * @param options => number        integer     count of total alphabet array sequence
     * @param options => lastLocalId     string      Starting character of sequence
     * @param obj           string      Extra object details
     *                                  only_alphabet: true ? Generate only alphabetic ids : 'A-1-1-'
     * @returns {Array}     array       Array of alphabet sequence
     * ex.
     *  request num : 5
     *          start_cha : "Y" => array start with +1 character
     *  return  array : ["Z", "AA", "AB", "AC", "AD"]
     *
     *  request num : 5
     *          start_cha : "" => array start with +1 character
     *  return  array : ["A", "B", "C", "D", "E"]
     */
    generateLocalId: function (options) {
        // set default parameters, if not available in request
        if (!_.has(options, 'returnString') && !options.returnString) {
            options.returnString = true;
        }
        if (!_.has(options, 'onlyAlphabet') && !options.onlyAlphabet) {
            options.onlyAlphabet = false;
        }
        if (!_.has(options, 'addSuffix') && !options.addSuffix) {
            options.addSuffix = '-';
        }
        if (!_.has(options, 'number') && !options.number) {
            options.number = 1;
        }

        let letters = '';
        let letterSeries = [];
        let i = 1;
        let lastLocalId = options.lastLocalId;
        if (options.onlyAlphabet) {
            lastLocalId = !_.isEmpty(lastLocalId) ?
                _.first(lastLocalId.split('-')) :
                '';

            /**
             * fromLetters => String letter to sequence number
             * ex. A - 1, B - 2, .. , AA - 27
             */
            let baseChar = 1;
            let len = lastLocalId.length;
            let pos = len;
            while ((pos -= 1) > -1) {
                baseChar += (lastLocalId.charCodeAt(pos) - 64) * Math.pow(26, len - 1 - pos);
            }

            /**
             * toLetters => Number to Alphabet letter
             * @param num => Int => ex. 1   2   ..  27
             * @returns {string} => ex. A   B   ..  AA
             */
            var toLetters = function (num) {
                'use strict';
                let mod = num % 26;
                let pow = (num / 26) | 0;
                let out = mod ? String.fromCharCode(64 + mod) : (pow--, 'Z');

                return pow ? toLetters(pow) + out : out;
            };

            do {
                letters = toLetters(baseChar);
                letterSeries.push(letters);
                baseChar += 1;
                i += 1;
            } while (i <= options.number);

            if (
                options &&
                ((options.addPrefix && !_.isEmpty(options.addPrefix)) ||
                    (options.addSuffix && !_.isEmpty(options.addSuffix)))
            ) {
                _.each(letterSeries, (ls, index) => {
                    if (options.addPrefix) {
                        letterSeries[index] = `${options.addPrefix}${ls}`;
                    }
                    if (options.addSuffix) {
                        letterSeries[index] = `${ls}${options.addSuffix}`;
                    }
                });
            }

            if (options.returnString) {
                return _.first(letterSeries);
            }

            return letterSeries;

        }
        options.lastSeqNum = options.lastSeqNum ? options.lastSeqNum : 0;
        let nextId = `${lastLocalId}${options.lastSeqNum + 1}-`;

        return nextId;

    },
    async getClientIpInfo(ip) {
        console.log(ip);
        ip = ip.replace('::ffff:', '');
        console.log(ip);

        return new Promise((resolve, reject) => {
            iplocation(ip, [], (error, res) => {
                if (error) {
                    console.log('failes to find ip details');
                }
                resolve({
                    ip: ip,
                    address: {
                        country: res && res.country ? res.country : '',
                        region: res && res.region ? res.region : '',
                        city: res && res.city ? res.city : '',
                        postalCode: res && res.postal ? res.postal : '',
                        latitude: res && res.latitude ? res.latitude : '',
                        longitude: res && res.longitude ? res.longitude : ''
                    },
                    time: moment().toISOString()
                });
            });
        });
    },
    doubleDateToString(doubleDate) {
        return doubleDate ?
            moment(doubleDate * 1000 * 60 * 60 * 24).format('MM/DD/YYYY') :
            '';
    },
    doubleDateToISO(doubleDate) {
        return doubleDate ?
            moment(doubleDate * 1000 * 60 * 60 * 24).toISOString() :
            '';
    },
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    convertObjectIdToString(array, key) {
        let response = [];
        _.each(array, (value) => {
            response.push(value[key].toString());
        });

        return response;
    },
    getDateWithCurrentTime(date) {
        let newDate = new Date(date).toTimeString();
        newDate = new Date(`${new Date().toDateString()} ${newDate}`);

        return newDate;
    },
    getStartOfTheDay(date) {
        return `${moment(date).format('YYYY-MM-DD')}T00:00:00.000Z`;
    },
    getStartOfTheMinute(date) {
        return `${moment(date).format('YYYY-MM-DDThh:mm')}:00.000Z`;
    },
    getEndOfTheMinute(date) {
        return `${moment(date).format('YYYY-MM-DDThh:mm')}:59.000Z`;
    },
    getEndOfTheDay(date) {
        return `${moment(date).format('YYYY-MM-DD')}T23:59:59.999Z`;
    },
    getFirstDateOfMonth() {
        return `${moment().startOf('month').format('YYYY-MM-DD')}T00:00:00.000Z`;
    },
    getTimeFromNow() {
        return moment().toISOString();
    },
    formatDate: (date) => {
        return date ? moment(date).format('MMM DD, YYYY HH:mm:ss a') : '-';
    },
    getDateTime(format = 'YYMMDDHHmmss') {
        return moment().format(format);
    },
    createDateFromTwoDate(takeDate, takeTime) {
        return moment(`${takeDate} ${takeTime}`, 'DD/MM/YYYY HH:mm').toISOString();
    },
    getPrimaryValue: (array, key) => {
        return array && array.length ? _.find(array, {
            isPrimary: true
        })[key] : '';
    },
    getPrimaryObj: (array) => {
        return array && array.length ? _.find(array, {
            isPrimary: true
        }) : '';
    },
    getTimeDifference(start, end, unit = 'minutes') {
        let time = moment(end).diff(moment(start), 'seconds');
        if (unit === 'minutes') {
            time /= 60;
        } else if (unit === 'hours') {
            time /= 3600;
        }

        return Number(parseFloat(time).toFixed(2));
    },
    getDayDifference(start, end) {
        let time = moment(end).diff(moment(start), 'days');

        return time || 0;
    },
    addTime(value, time = null, unit = 'minutes') {
        if (time === null) {
            time = moment().toISOString();
        }

        return moment(time).add(value, unit).toISOString();
    },
    addExpireTime(time, endTime) {
        let formatedTime = moment(time).format('YYYY-MM-DD');
        return moment(formatedTime + ' ' + endTime).toISOString();
    },
    isBeforeTime(start, end) {
        return moment(start).isBefore(moment(end));
    },
    checkTimeBetweenWorkingHour(time, start, end) {
        let formatedTime = moment(time).format('HH:mm');
        let currentTime = moment(formatedTime, 'hh:mm:ss');
        let beforeTime = moment(start, 'hh:mm:ss');
        let afterTime = moment(end, 'hh:mm:ss');

        return currentTime.isBetween(beforeTime, afterTime)
    },
    getDayIn1970(dateTime) {
        return moment(
            `1970-01-01T${moment(dateTime).format("HH:mm")}:00.000Z`
        ).toISOString();
    },
    checkTimeBetweenHour(start, end) {
        let currentTime = this.getTimeFromNow();
        currentTime = this.getDayIn1970(currentTime);
        let beforeTime = this.getDayIn1970(start);
        let afterTime = this.getDayIn1970(end);
        console.log('afterTime', afterTime);
        let isAfterTimeIsSmall = moment(afterTime).isBefore(beforeTime);
        console.log('isAfterTimeIsSmall', isAfterTimeIsSmall);

        if (isAfterTimeIsSmall) {
            afterTime = moment(afterTime).add(1, 'day').toISOString();
        }
        console.log('final afterTime', afterTime);
        console.log('beforeTime', beforeTime);

        return moment(currentTime).isBetween(beforeTime, afterTime);
    },
    getFloat(value) {
        return Number(parseFloat(value).toFixed(2));
    },
    difference(object, base) {
        function changes(object, base) {
            return _.transform(object, (result, value, key) => {
                if (!_.isEqual(value, base[key])) {
                    result[key] = _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
                }
            });
        }

        return changes(object, base);
    },
    convertOmniUTCDate(date, time) {
        let newDate = `${date} ${time}`;

        return moment(newDate, 'DDMMYY HHmmss.SS').toISOString();
    },
    convertKmToMiles(km) {
        if (km <= 0) {
            return km;
        }

        return Number(parseFloat(km / 1.609344).toFixed(2));
    },
    currTimeInYearForIot(date = null) {
        let time = moment();
        if (date) {
            time = moment(date);
        }
        let currTimeInYear = time.utcOffset(0).format('YYMMDDHHmmss');

        return currTimeInYear;
    },
    currTimeInFullYearForIot(date = null) {
        let time = moment();
        if (date) {
            time = moment(date);
        }
        let currTimeInYear = time.utcOffset(0).format('YYYYMMDDHHmmss');

        return currTimeInYear;
    },
    getUnixTimestampInSeconds() {
        let currTime = moment().unix();

        return currTime;
    },

    addTimeForCurrentDate(endTime, date,timezone) {
        if(!timezone){
            timezone = sails.config.DEFAULT_TIME_ZONE;
        }
        let currentDate = moment().tz(timezone).format('YYYY-MM-DD');
        if (date) {
            currentDate = moment(date).tz(timezone).format('YYYY-MM-DD');
        }
        currentDate = currentDate + ' ' + endTime;
        return currentDate;
    },
    checkTimeBetweenDate(start, end) {
        let data = moment().isBetween(start, end);

        return data;
    },
    convertDMSToLocation(latInput, latDirection, lngInput, lngDirection) {
        let latitude = Number(latInput.slice(0, 2)) +
            (Number(latInput.slice(2, 10)) / 60);
        let longitude = Number(lngInput.slice(0, 3)) +
            (Number(lngInput.slice(3, 11)) / 60);

        let { lat, lng } = this.setDirectionWiseLocation(latDirection, lngDirection, latitude, longitude);

        return { lat, lng }
    },

    setDirectionWiseLocation(latDirection, lngDirection, lat, lng) {
        if (latDirection === 'S') {
            lat *= -1;
        }
        if (lngDirection === 'W') {
            lng *= -1;
        }
        // console.log("Lat , Long", lat, lng);
        return {
            lat,
            lng
        };
    },

    subtractTime(value, time = null, unit = 'minutes') {
        if (time === null) {
            time = moment().toISOString();
        }

        return moment(time).subtract(value, unit).toISOString();
    },
    getIotCommandExpiryTime() {
        let time = this.addTime(sails.config.IOT_REQUEST_TIME_OUT_LIMIT, null, 'seconds');

        return time;
    },
    getDifferenceOfLocation(coordinate1, coordinate2) {
        const R = 6371; // Radius of earth
        let diffLat = this.degreeToRadian(coordinate2.lat - coordinate1.lat);
        let diffLng = this.degreeToRadian(coordinate2.lng - coordinate1.lng);
        let lat1 = this.degreeToRadian(coordinate1.lat);
        let lng1 = this.degreeToRadian(coordinate1.lng);

        let distance = Math.sin(diffLat / 2) * Math.sin(diffLat / 2) + Math.sin(diffLng / 2) * Math.sin(diffLng / 2) * Math.cos(lat1) * Math.cos(lng1);
        distance = 2 * Math.atan2(Math.sqrt(distance), Math.sqrt(1 - distance));
        distance = R * distance;

        return distance * 1000;
    },
    degreeToRadian(degree) {
        return degree * Math.PI / 180;
    },
    hex2Ascii(hex) {
        let ascii = '';
        for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
            ascii += String.fromCharCode(parseInt(hex.substr(i, 2), 16));

        return ascii;
    },

    ascii2Hex(ascii) {
        let hex = '';
        for (let i = 0; i < ascii.length; i++)
            hex += ascii.charCodeAt(i).toString(16);

        return hex;
    },

    hexToDec(hex) {
        let decimalNo = parseInt(hex.toString(), 16);

        return decimalNo;
    },

    decToHex(dec) {
        let hex = dec.toString(16);

        return hex;
    },

    hex2bin(hex) {
        let binary = ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);

        return binary;
    },

    getDecimalConvertedObject(data) {
        for (let key in data) {
            data[key] = this.hexToDec(data[key]);
        }

        return data;
    },

    generateMd5Hash(data) {
        const crypto = require('crypto');
        let hash = crypto.createHash('md5').update(data).digest('hex').toLowerCase();

        return hash;
    },

    dec2bin(dec) {
        let binary = parseInt(dec).toString(2);

        return binary;
    },

    floatToPercentage(float) {
        var percent = Math.round(float * 100);
        return percent;
    },

    minutesToSubtractDate(minutes) {
        var now = new Date();
        var date = moment(now).subtract(minutes, "minutes").toDate().toISOString();
        if (minutes === 0) {
            date = now.toISOString();
        }
        if (minutes >= 1440) {
            date = this.getStartOfTheDay(moment(date)
                .startOf("day")
                .toISOString())
        }
        return date;
    },

    minutesToAddDate(date, minutes) {
        var date = moment(date).add(minutes, "minutes").toDate().toISOString();

        return date;
    },
    trimFirstZeroes(str) {
        return str.toString().replace(/^0+/, '');
    },
    randomReferralCode() {
        var i, key = "", characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        var charactersLength = characters.length;

        for (i = 0; i < 6; i++) {
            key += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
        }
        key = key.toUpperCase();

        return key;
    },
    binaryAddition(a, b) {
        var result = "",
            carry = 0;

        while (a || b || carry) {
            let sum = +a.slice(-1) + +b.slice(-1) + carry; // get last digit from each number and sum

            if (sum > 1) {
                result = sum % 2 + result;
                carry = 1;
            }
            else {
                result = sum + result;
                carry = 0;
            }

            // trim last digit (110 -> 11)
            a = a.slice(0, -1)
            b = b.slice(0, -1)
        }

        return result;

    },
    reverseBinary(str) {
        let reversed = str.split('').map(b => (1 - b).toString()).join('');

        return reversed;
    },
    binToDec(binary) {
        return parseInt(binary.toString(), 2);
    },
    convertAckToLocation(data) {
        let binaryData = '';
        for (let i = 0; i < data.length / 2; i++) {
            let start = i * 2;
            let end = 2;
            // console.log(`Start = ${start}, end = ${end}`);
            let tmpData = this.hex2bin(data.substr(start, end));
            // console.log(`data.substr(start, end) => ${data.substr(start, end)} , tmpData = ${tmpData}`);
            binaryData += tmpData;
        }
        // 1111 1111 0110 0011 1000 1000 1000 1000
        // console.log('binaryData', binaryData);
        let firstLetter = binaryData.substr(0, 1);
        // console.log('firstLetter', firstLetter);
        let strForDecimal = binaryData;
        let isMinusLatLong = false;
        if (firstLetter == "1") {
            isMinusLatLong = true;
            let inverseData = this.reverseBinary(binaryData);
            // console.log('inverseData', inverseData);
            strForDecimal = this.binaryAddition(inverseData, "1");
        }

        let latLong = this.binToDec(strForDecimal);
        // console.log(`latLong = ${latLong}, strForDecimal = ${strForDecimal}`);

        latLong /= 10000000;
        if (isMinusLatLong) {
            latLong *= -1;
        }

        return latLong;
    },
    async getUserSocket(userId) {
        return await RedisDBService.getData(`socket-${userId}`);
    },
    async setUserSocket(userId, data) {
        return await RedisDBService.setData(`socket-${userId}`, data);
    },
    async getUserPlayerIds(userId) {
        return await RedisDBService.getData(`playerIds-${userId}`);
    },
    async setUserPlayerIds(userId, data) {
        return await RedisDBService.setData(`playerIds-${userId}`, data);
    },
    getDiscountedValue(value, percentage) {
        let discount = Math.round(value * percentage) / 100;
        let result = value - discount;

        return result;
    },
    async getNotificationPlayerIds(userId) {
        let userWithPlayerIds = await this.getUserPlayerIds(userId);
        let preferredLang;
        if (!userWithPlayerIds || !userWithPlayerIds.id) {
            userWithPlayerIds = await User.findOne({
                where: { id: userId },
                select: ['androidPlayerId', 'iosPlayerId', 'preferredLang'],
            });
            console.log('userWithPlayerIds', userWithPlayerIds);
            await this.setUserPlayerIds(userId, userWithPlayerIds);
            preferredLang = userWithPlayerIds.preferredLang;
        }
        let playerIds = [];
        if (userWithPlayerIds.androidPlayerId) {
            playerIds = playerIds.concat(userWithPlayerIds.androidPlayerId);
        }
        if (userWithPlayerIds.iosPlayerId) {
            playerIds = playerIds.concat(userWithPlayerIds.iosPlayerId);
        }

        return { playerIds, preferredLang };
    }
};