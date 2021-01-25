module.exports["swagger"] = {
    swaggerJsonPath: "./assets/swagger.json",
    parameters: {
        //we can add up custom parameters here
        TokenHeaderParam: {
            in: "header",
            name: "Authorization",
            required: false,
            type: "string",
            description:
                "For device api please send device token with prefix JWT . EX:- JWT <your token>"
        }
    },
    disabled: false,
    swagger: {
        swagger: "2.0",
        info: {
            title: "E-Scooter"
        },
        host: (function() {
            let interfaces = require("os").networkInterfaces();
            for (let devName in interfaces) {
                let iface = interfaces[devName];
                for (let i = 0; i < iface.length; i++) {
                    let alias = iface[i];
                    if (
                        alias.family === "IPv4" &&
                        alias.address !== "127.0.0.1" &&
                        !alias.internal
                    ) {
                        return alias.address + ":" + 1376;
                    }
                }
            }
            return "127.0.0.1" + ":" + 1376;
        })(),
        basePath: "/",
        externalDocs: { url: "http://www.coruscate.info" }
    }
};
