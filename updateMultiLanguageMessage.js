const fs = require('fs');
const messageFile = require('./server/config/message');
async function updateFileData() {
    const messages = messageFile.message;
    let newMessages = {};
    for (const key in messages) {
        let message = messages[key].message;
        newMessages[message] = message;
    }

    let files = await fs.readdirSync('./server/config/locales');
    for (const filename of files) {
        let newMessagesForFile = {};
        let fileData = await fs.readFileSync(`./server/config/locales/${filename}`, 'utf-8');
        fileData = JSON.parse(fileData);
        for (let key in newMessages) {
            let currentFileMsg = newMessages[key];
            if (!fileData[currentFileMsg]) {
                newMessagesForFile[currentFileMsg] = currentFileMsg;
            }

        }
        if (Object.keys(newMessagesForFile).length > 0) {
            let json = JSON.stringify(newMessagesForFile);
            await fs.appendFileSync(`./server/config/locales/${filename}`, json);
        }
    }
    console.log('Awesome You updated All File! :D');
}

updateFileData();

// 1st read message File
// 2nd read all locale File
// 3rd loop on message filename
//  check if message exists in locale filename if not add it into array and append it