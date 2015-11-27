// util.js

let type = require('./type');
let reg = require('./reg_exps');
let cookie = require('./cookie');
let query = require('./query');
let encryption = require('./encrypt');
let history = require('./history');

let utils = Object.assign({}, type, reg, cookie, query, encryption, history);

module.exports = utils;
