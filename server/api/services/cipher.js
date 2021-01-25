var jwt = require('jsonwebtoken');
var crypto = require('crypto');
const _ = require('lodash');
const fs = require('fs');

const EXPIRES_IN_SECONDS = 60 * 24 * 30 * 12 * 60; // 360 days
const SECRET_KEY = "EtU0USaA9KlVjnbWVQSjsR6r0eQdn7DMbGA3rVj8ijTHE9Dm8dS7i2dmP9KjQER";
const ISSUER = "smarthumanoid.com";
const AUDIENCE = "smarthumanoid.com";
const ALGORITHM = "HS256";


module.exports = {
    /**
     * Create a token based on the passed user
     * @param user
     */
    createToken: (user, expireTime) => {

        // cipher('jwt', JWT_STRATEGY_CONFIG).encodeSync({id: user.id})

        let token_attrs = ['name', 'cell', 'email', 'id', 'conference_id', 'is_authenticated'];
        let user_token = _.pick(user, token_attrs);

        //user: user.toJSON()
        return jwt.sign({
            user: user_token
        },
            SECRET_KEY,
            {
                algorithm: ALGORITHM,
                expiresIn: expireTime ? expireTime : EXPIRES_IN_SECONDS,
                issuer: ISSUER,
                audience: AUDIENCE
            }
        );
    },
    encryptData(data) {
        const NodeRSA = require('node-rsa');
        const key = new NodeRSA(fs.readFileSync(sails.config.appPath + "/api/data/secure.pem"));
        return key.encrypt(data, 'base64');
    }
};
