// util.js

let type = require('./type');
let reg = require('./reg_exps');
let cookie = require('./cookie');
let query = require('./query_to_json');
let encryption = require('./encrypt');

let utils = Object.assign({}, type, reg, cookie, query, encryption);

module.exports = utils;
