import crypto from 'crypto';

const WORKING_KEY = 'AERT12YGH3UJB4HGDK';

const textEncrypt = (plainText) => {
    const workingKey = WORKING_KEY;
    let m = crypto.createHash('md5');
    m.update(workingKey);
    if (m) {
        let key = m.digest();
        let iv = '\x0c\x0d\x0e\x0f\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b';
        let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let encoded = cipher.update(plainText, 'utf8', 'hex');
        encoded += cipher.final('hex');

        return encoded;
    }
};
const textDecrypt = (encText) => {
    if (encText === '') {
        return encText;
    }
    const workingKey = WORKING_KEY;
    let m = crypto.createHash('md5');
    m.update(workingKey);
    let key = m.digest();
    let iv = '\x0c\x0d\x0e\x0f\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b';
    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decoded = decipher.update(encText, 'hex', 'utf8');
    decoded += decipher.final('utf8');

    return decoded;
};
const UtilLocalService = {
    setLocalStorage: (key, value) => {
        let setKey = textEncrypt(JSON.stringify(key));
        let setValue = textEncrypt(JSON.stringify(value));
        localStorage.setItem(setKey, setValue);
    },
    getLocalStorage: (key) => {
        let setKey = textEncrypt(JSON.stringify(key));
        let data = localStorage.getItem(setKey);
        return data ? JSON.parse(textDecrypt(data)) : null;
    },
    removeLocalStorage: (key) => {
        let setKey = textEncrypt(JSON.stringify(key));
        localStorage.removeItem(setKey);
    }

};

export default UtilLocalService;