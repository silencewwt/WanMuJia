let query = {
  queryStringToJson: (query) => {
    var o = {};
    query.split('&')
      .forEach(function (param) {
        var key = decodeURIComponent(param.split('=')[0]);
        var value = decodeURIComponent(param.split('=')[1]);
        o[key] = value;
      });

    return o;
  }
};

module.exports = query;
