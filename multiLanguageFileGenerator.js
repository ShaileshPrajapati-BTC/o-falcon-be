const fs = require('fs');
const messageFile = require('./server/config/message');
async function getFileData() {
    const messages = messageFile.message;
    let newMessages = {};
    for (const key in messages) {
        let message = messages[key].message;
        newMessages[message] = message;
    }

    let json = JSON.stringify(newMessages);
    await fs.writeFileSync('./server/config/locales/tr.json', json);
}

getFileData();