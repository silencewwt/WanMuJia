let md5Hex = require('md5-hex');

let encryption = {
  encryptMd5: function (key) {
    return md5Hex(md5Hex(key));
  }
};

module.exports = encryption;
