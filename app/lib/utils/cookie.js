  let cookieOperation = {
  setCookie: (cookieName, coockieValue, expiredays, path) => {
    var cookieText = encodeURIComponent(cookieName) + '=' +
      encodeURIComponent(coockieValue);

    if (expiredays instanceof Date) {
      cookieText += "; expires=" + expiredays.toUTCString();
    }

    cookieText += "; path=" + (path ? path : "/");

    return (document.cookie = cookieText);
  },

  getCookie: (cookieName) => {
    var value;

    decodeURIComponent(document.cookie)
      .split('; ')
      .forEach(function (cookie) {
        cookie = cookie.split('=');
        if (cookieName === cookie[0]) {
          value = cookie[1];
        }
      });

    return value;
  }
};

module.exports = cookieOperation;
