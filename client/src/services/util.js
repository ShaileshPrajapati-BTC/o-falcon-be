import * as _ from "lodash";
import moment from "moment";
import { DEFAULT_LANGUAGE, LANGUAGES_NAME, DEFAULT_BASE_CURRENCY } from "../constants/Common";

const UtilService = {
    getKeyByValue: (object, value) => {
        return _.findKey(object, _.partial(_.isEqual, value));
        // return Object.keys(object).find(key => object[key] === value);
    },
    getPrimaryValue: (array, key) => {
        return array && array.length
            ? _.find(array, { isPrimary: true })
                ? _.find(array, { isPrimary: true })[key]
                : ""
            : "";
    },
    getPrimaryObj: array => {
        return array && array.length ? _.find(array, { isPrimary: true }) : "";
    },
    displayDate: (date, hour24 = false) => {
        let timeStr = "hh:mm a";
        if (hour24) {
            timeStr = "HH:mm";
        }

        return date ? moment(date).format(`MMM DD, YYYY ${timeStr}`) : "-";
    },
    displayTime: (date, hour24 = false) => {
        let timeStr = "hh:mm a";
        if (hour24) {
            timeStr = "HH:mm";
        }

        return date ? moment(date).format(timeStr) : "-";
    },

    displayOnlyDate: date => {
        return date ? moment(date).format("MMM DD, YYYY") : "-";
    },
    displayUserDOB: (date, hour24 = false) => {
        let timeStr = "hh:mm a";
        if (hour24) {
            timeStr = "HH:mm";
        }

        return date ? moment(date, 'DD-MM-YYYY').format(`MMM DD, YYYY ${timeStr}`) : "-";
    },
    displayDOB: date => {
        if (!date) {
            return "-";
        }
        const age = moment().diff(moment(date, "DD-MM-YYYY"), "years");

        return `${moment(date, "DD-MM-YYYY").format(
            "Do MMM. YYYY"
        )} (${age} Year)`;
    },
    displayFromNow: date => {
        return date ? moment(date).fromNow() : "-";
    },
    getDays: date => {
        return date ? `${moment().diff(date, "days")} days ago` : null;
    },
    getSecondsToTime: sec => {
        let seconds = parseInt(sec, 10);
        let d = Math.floor(seconds / (3600 * 24));
        let h = Math.floor(seconds % (3600 * 24) / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 60);
        let month = Math.floor(seconds / (3600 * 24 * 30));
        let year = Math.floor(seconds / (3600 * 24 * 30 * 12));
        let yearDisplay = year > 0 ? year + (year === 1 ? " year, " : " years, ") : "";
        let monthDisplay = month > 0 ? month + (month === 1 ? " month, " : " months, ") : "";
        let dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
        let hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
        let mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
        let sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
        return yearDisplay + monthDisplay + dDisplay + hDisplay + mDisplay + sDisplay;
    },
    copyToClipboardFn: (event, context) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const el = document.createElement("textarea");
        el.value = JSON.parse(JSON.stringify(context));

        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";

        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    },
    getDayIn1970: dateTime => {
        return moment(
            `01/01/1970 ${moment(dateTime).format("HH:mm")}:00`
        ).toISOString();
    },
    checkTimeIsSameOrBefore: (afterTime, beforeTime) => {
        return moment(afterTime).isSameOrBefore(beforeTime);
    },
    checkTimeIsSameOrAfter: (afterTime, beforeTime) => {
        return moment(afterTime).isSameOrAfter(beforeTime);
    },
    checkTimeIsBefore: (afterTime, beforeTime) => {
        return moment(afterTime).isBefore(beforeTime);
    },
    checkTimeIsAfter: (afterTime, beforeTime) => {
        return moment(afterTime).isAfter(beforeTime);
    },
    getStartOfTheDayIn1970() {
        return moment(`01/01/1970 00:00:00`).toISOString();
    },
    getEndOfTheDayIn1970() {
        return moment(`01/01/1970 23:59:00`).toISOString();
    },
    getStartOfTheDay(date) {
        // return `${moment(date).format('YYYY-MM-DD')}T00:00:00.000Z`;
        return moment(date).startOf('day').toISOString();
    },
    getEndOfTheDay(date) {
        // return `${moment(date).format('YYYY-MM-DD')}T23:59:59.999Z`;
        return moment(date).endOf('day').toISOString();
    },
    getSecondsToHms(d) {
        let secs = d;
        // secs *= 60;
        let formatted = moment.utc(secs * 1000).format("HH:mm:ss");

        return formatted;
    },
    convertSecToMinHr(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        return (h + ':' + m);
    },
    roundOff(number, lenth = 2) {
        return Number(parseFloat(number).toFixed(lenth));
    },

    getKeysNameFromVal(val, obj) {
        let name = "";
        name = _.findKey(obj, _.partial(_.isEqual, val));

        return name;
    },
    getKeysNameFromValForDisplay(val, obj) {
        let name = "";
        name = _.findKey(obj, _.partial(_.isEqual, val));
        name = _.upperFirst(_.lowerCase(name));

        return name;
    },
    setFormDataForLanguage(fields, language, data) {
        let values = data || {};
        for (let field of fields) {
            if (data && data[field]) {
                if (!values.multiLanguageData) {
                    values.multiLanguageData = {};
                }
                if (!values.multiLanguageData[language]) {
                    values.multiLanguageData[language] = {};
                }
                values.multiLanguageData[language][field] = data[field];
                if (!values.multiLanguageData[DEFAULT_LANGUAGE]) {
                    values.multiLanguageData[DEFAULT_LANGUAGE] = {};
                }
                values[field] =
                    values.multiLanguageData[DEFAULT_LANGUAGE][field] || null;
            }
        }

        return values;
    },
    getLanguageValues(fields, language, data) {
        // data = multiLanguageData
        const values = {};

        for (let field of fields) {
            values[field] = null;
            if (data && data[language] && data[language][field]) {
                values[field] = data[language][field];
            }
        }

        return values;
    },
    defaultLanguageDataValidation(fields, data) {
        for (const field of fields) {
            if (!data.multiLanguageData[DEFAULT_LANGUAGE][field]) {
                let message = `${field} value is required for
                    ${LANGUAGES_NAME[DEFAULT_LANGUAGE]} Language.
                `;

                return message;
            }
        }

        return true;
    },
    displayNumber: value => {
        return Number(parseFloat(value).toFixed(2));
    },
    displayPrice(price = 0) {
        return `${DEFAULT_BASE_CURRENCY} ${this.displayNumber(price)}`;
    },
    displayTwoDigit: () => {
        // return (
        //     <Tooltip title={value}>
        //         {value.toFixed(2)}
        //     </Tooltip>
        // );
    },
    displayExpiredMessage: (walletExpireDate) => {
        if (walletExpireDate) {
            let startDate = moment(moment().toISOString(), 'YYYY-MM-DD');
            let endDate = moment(walletExpireDate, 'YYYY-MM-DD');
        
            let years = endDate.diff(startDate, 'year');
            startDate = moment(startDate).add(years, 'years');
        
            let months = endDate.diff(startDate, 'months');
            startDate = moment(startDate).add(months, 'months');
        
            let days = endDate.diff(startDate, 'days');
            startDate = moment(startDate).add(days, 'days');
            if (days === 0 && months === 0 && years === 0) {
                
                let sDate = moment().toISOString()
                let eDate = moment(walletExpireDate);

                let days = moment(eDate).diff(sDate, 'days');
                sDate = moment(sDate).add(days, 'days');

                let hours = moment(eDate).diff(sDate, 'hours');
                sDate = moment(sDate).add(hours, 'hours');

                let minutes = moment(eDate).diff(sDate, 'minutes');
                sDate = moment(sDate).add(minutes, 'minutes');
                if(hours===0){ 
                   return ` ${minutes>0?`(Expires in ${minutes} Minutes)`:''}`;       
                }
                return ` (Expires in ${hours} Hours and ${minutes} Minutes)`;
            }
            return ` (Expires in ${years !== 0 ? years + " Year" : ''}${months !== 0 ? months===1?months+ "  Month ":months+ "  Months " : ''}${days !== 0 ? days + " Days" : ''})`;
        }
        return '';
    },
    checkAlphaNumericPassword: pwd => {
        const letter = /[a-zA-Z]/;
        const number = /[0-9]/;
        const valid = number.test(pwd) && letter.test(pwd);

        return valid;
    },
    commonFilter(filterObject) {
        let data = _.find(filterObject.listData, {
            value: filterObject.selectedVal
        });
        console.log("TCL: commonFilter -> data", data);
        let sortBy;
        let response;
        if (data) {
            sortBy = data.type
                ? filterObject.isAscending
                    ? `${data.type} ASC`
                    : `${data.type} DESC`
                : "error";
            response = filterObject.key === "sort" ? sortBy : data;
            console.log("TCL: commonFilter -> response", response);
        }
        if (response) {
            return response;
        } else {
            return "error";
        }
    },
    getDefaultValue(commonArray, filterData) {
        let result = _.find(commonArray, f => f.type === filterData)
        return result.value;
    },
    getDeviceId() {
        let deviceId = `escooter${Math.random().toString(36).replace('.', 1)}`
        return deviceId.slice(0, 15);
    }
};


export default UtilService;
