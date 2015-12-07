let type = require('./type');

let query = {
  getUrlQuery: function () {
    return window.location.search.slice(1);
  },
  queryStringToJson: function (query) {
    var o = {};
    query.split('&')
      .forEach(function (param) {
        var key = decodeURIComponent(param.split('=')[0]);
        var value = decodeURIComponent(param.split('=')[1]);
        o[key] = value;
      });

    return o;
  },
  jsonToQueryString: function (json) {
    return Object.keys(json).reduce((queryArr, key) => {
      let value = json[key];
      type.isArray(value) ?
        value.forEach((eachValue) => {
          queryArr.push(key + '=' + encodeURIComponent(eachValue));
        }) :
        queryArr.push(key + '=' + encodeURIComponent(json[key]));
      return queryArr;
    }, []).join('&');
  }
};

module.exports = query;
