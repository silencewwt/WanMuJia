let type = {
  isObject: (obj) => {
    return obj instanceof Object;
  },
  isArray: (arr) => {
    if (Array.isArray) {
      return Array.isArray(arr);
    }
    return arr instanceof Array;
  },
  isFunction: (fn) => {
    return fn instanceof Function;
  }
};

module.exports = type;
