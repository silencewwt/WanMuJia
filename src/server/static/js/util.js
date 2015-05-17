// util.js

function setCookie(cookieName, coockieValue, expiredays) {
    var cookieText = encodeURIComponent(cookieName) + '=' +
        encodeURIComponent(coockieValue);

    if (expiredays instanceof Date) {
        cookieText += "; expires=" + expiredays.toGMTString();
    }

    return document.cookie = cookieText;
}

function getCookie(cookieName) {
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