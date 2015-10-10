$(function() {

    var NEXTURL = "/";
    var $tip = $("#tip");

    var TIME = 3000;

    var waitTime = setInterval(function() {
        TIME -= 1000;
        $tip.text(TIME/1000 + "秒后自动跳转");
        if(TIME === 0) {
            clearTimeout(waitTime);
            window.location.href = NEXTURL;
        }
    } , 1000);

});
