'use strict';

module.exports = {
    services: {
        file: {
            maxMegaBytes: 22,
            validFileTypes: [
                // IMAGES
                '.jpeg',
                '.jpg',
                '.bmp',
                '.gif',
                '.png',
                '.tif',

                // TEXT
                '.txt',

                // APPLICATION FORMAT
                '.rtf',
                '.doc',
                '.docx',
                '.xls',
                '.xlsx',
                '.ppt',
                '.odt',
                '.odt',
                '.ods',
                '.odp'
            ],
            defaultDestinations: 'images'
        }
    },
    EXCEL_HEADER: [
        'NAME',
        'IMEI',
        'QR NUMBER',
        'TYPE',
        'MANUFACTURER',
        'MAC ADDRESS',
        'LOCK MANUFACTURER',
        'CHARGER PLUG',
        'CHARGER POWER'
    ]
};
