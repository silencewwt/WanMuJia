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

// RegExps
function getRegs() {
    return {
        mobile: /^((1[3-8][0-9])+\d{8})$/,
        tel: /^\d{3,4}-?\d{7,9}$/,
        identity: /^\d{15}(\d\d[0-9xX])?$/,
        password: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}$/,
        date: /^(\d{4})\/((0?([1-9]))|(1[0|1|2]))\/((0?[1-9])|([12]([0-9]))|(3[0|1]))$/
    };
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

        if (this.type == 'button' || this.type == 'submit' || this.type == 'reset') {
            return;
        }
        else if (this.type == 'password' && this.value.length > 0) {
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

function setFormPending($form) {
    $form.data('pending', true);
}
function setFormReady($form) {
    $form.data('pending', false);
}
function getFormState($form) {
    return $form.data('pending');
}

// compareItem Cookie option : addItemCookie 、 deleteItemCookie 、 getItemCookie.
var setCompareItem = {
    getCookie: function(name) {
        var strCookie=document.cookie;
        var arrCookie=strCookie.split("; ");
        for(var i = 0 ;i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if(name == arr[0]) {
                return arr[1];
            }
        }
        return false;
    },
    addItem: function(cookieId) {
        if(this.getCookie('compareItem1')==cookieId||this.getCookie('compareItem2')==cookieId) {
            return {status: false,msg: "重复添加"};
        }
        if(!this.getCookie('compareItem1')) {
            document.cookie  = 'compareItem1=' + cookieId;
            return {status: true,msg: "添加成功"};
        } else if(!this.getCookie('compareItem2')) {
            document.cookie  = 'compareItem2=' + cookieId;
            return {status: true,msg: "添加成功"};
        } else {
            return {status: false,msg: "添加上限2个"};
        }
    },
    deleteItem: function(cookieId) {
        var date=new Date();
        date.setTime(date.getTime()-10000);
        var strCookie=document.cookie;
        var arrCookie=strCookie.split("; ");
        for(var i = 0 ;i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if("compareItem1" == arr[0]&&cookieId == arr[1]) {
                document.cookie="compareItem1=0; expires="+date.toGMTString();
            }
            if("compareItem2" == arr[0]&&cookieId == arr[1]) {
                document.cookie="compareItem2=0; expires="+date.toGMTString();
            }
        }
    },
    getItem: function() {
        var itemIds = [];
        var i = 0;
        if(this.getCookie('compareItem1')) {
            itemIds[i] = this.getCookie('compareItem1');
            i++;
        } if(this.getCookie('compareItem2')) {
            itemIds[i] = this.getCookie('compareItem2');
        }
        return itemIds;
    }
};
// console.log(setCompareItem.addItem(2));
// console.log(setCompareItem.getItem());
// setCompareItem.deleteItem(1);
