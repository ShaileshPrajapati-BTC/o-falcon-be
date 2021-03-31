const modelName = 'UserCard';
const crypto = require('crypto');

const encrypt = (plainText) => {
  if (plainText === '') {
      return plainText;
  }
  const workingKey = sails.config.CRYPTO_WORKING_KEY;
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
}

const decrypt = (encText) => {
  if (encText === '') {
      return encText;
  }
  const workingKey = sails.config.CRYPTO_WORKING_KEY;
  let m = crypto.createHash('md5');
  m.update(workingKey);
  let key = m.digest();
  let iv = '\x0c\x0d\x0e\x0f\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b';
  let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decoded = decipher.update(encText, 'hex', 'utf8');
  decoded += decipher.final('utf8');

  return decoded;
}

module.exports = {
  async paginate(req, res) {
      let params = req.allParams();
      try {
          let userId = req.user.id;
          let response = {};
          console.log(params,req.user.id)
          let cards = await UserCard.find({userId});
          response.list = cards;
          response.count = cards.length;

          return res.ok(response, sails.config.message.OK);
      } catch (e) {
          console.log(e);
          return res.serverError(null, sails.config.message.SERVER_ERROR);
      }
  },
  async addCard(req, res) {
    let params = req.allParams();
    try {
        let userId = req.user.id;
        let response = {};
        console.log(params,req.user.id)
        let option = {
          params: params,
          modelName: modelName
        };
        let body={
          ...params,
          userId: userId
        }
        // let encryptText = await encrypt(params.cardNumber)
        // console.log("encryptText",encryptText)
        // console.log(await decrypt(encryptText))
        await commonValidator.validateCreateParams(option);
        await UserCard.create(body)
        return res.ok(response, sails.config.message.OK);
    } catch (e) {
        console.log(e);
        return res.serverError(null, e);
    }
  },
  async deleteCard(req, res) {
    let params = req.allParams();
    try {
        let userId = req.user.id;
        let response = {};
        console.log(params,req.user.id)
        let cardDetail = await UserCard.findOne({ id: params.id, userId: userId });
        if (!cardDetail) {
          return res.notFound({}, sails.config.message.CARD_NOT_FOUND);
        }
        await UserCard.destroy({ id: params.id, userId: userId })
        return res.ok(response, sails.config.message.OK);
    } catch (e) {
        console.log(e);
        return res.serverError(null, e);
    }
  },
  async setDefaultCard(req, res) {
    let params = req.allParams();
    try {
        let userId = req.user.id;
        let response = {};
        console.log(params,req.user.id)

        let cardDetail = await UserCard.findOne({ id: params.id, userId: userId });

        if (!cardDetail) {
          return res.notFound({}, sails.config.message.CARD_NOT_FOUND);
        }
        
        await UserCard.update({ isDefault: true, userId: userId }).set({
          isDefault: false
        }).fetch();

        await UserCard.update({ id: params.id, userId: userId }).set({
          isDefault: true
        }).fetch();
        
        return res.ok(response, sails.config.message.OK);
    } catch (e) {
        console.log(e);
        return res.serverError(null, e);
    }
  },
}
