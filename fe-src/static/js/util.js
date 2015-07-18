// util.js

// Type
function isObject(obj) {
    return obj instanceof Object;
}

function isArray(arr) {
    if (Array.isArray) {
        return Array.isArray(arr);
    }
    return arr instanceof Array;
}

function isFunction(fn) {
    return fn instanceof Function;
}


// Cookies
function setCookie(cookieName, coockieValue, expiredays) {
    var cookieText = encodeURIComponent(cookieName) + '=' +
        encodeURIComponent(coockieValue);

    if (expiredays instanceof Date) {
        cookieText += "; expires=" + expiredays.toGMTString();
    }

    return (document.cookie = cookieText);
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


// queryString to json
function queryStringToJson(query) {
    var o = {};
    query.split('&')
            .forEach(function (param) {
                var key = param.split('=')[0];
                var value = param.split('=')[1];
                o[key] = value;
            });

    return o;
}

// Encryption
function encrypt(key) {
    return hex_md5(hex_md5(key));
}

function genFormData($form, files) {
    var data = {};

    $form.find('input').each(function () {
        var value = null;

        if (this.type == 'password' && this.value.length > 0) {
            value = encrypt(this.value);
        }
        else if (this.type == 'file' && files !== undefined) {
            console.log(files);
            value = files[this.name];
        }
        else {
            value = this.value;
        }

        data[this.name] = value;
    });

    $form.find('select').each(function () {
        data[this.name] = this.value;
    });

    $form.find('textarea').each(function () {
        data[this.name] = this.value;
    });

    return data;
}
