// util.js

let type = require('./type');
let reg = require('./reg_exps');
let cookie = require('./cookie');
let query = require('./query');
let encryption = require('./encrypt');
let history = require('./history');

let oExtends = function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};

let utils = oExtends({}, type, reg, cookie, query, encryption, history);
utils.oExtends = oExtends;

module.exports = utils;
