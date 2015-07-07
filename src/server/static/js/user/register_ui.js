// register ui

function sendEnable($send, value) {
    $send.val(value);
    $send.removeClass('disabled');
}

function sendDisable($send, time, delayTime) {
    var timePass = parseInt((delayTime - time + parseInt(getCookie('clickTime'))) / 1000);
    $send.addClass('disabled');
    $send.val(timePass + ' 秒后再次发送');
}

function setCountDown($send, originValue, DELAYTIME) {
    var countDown = setInterval(function () {
        if (Date.now() - getCookie('clickTime') >= DELAYTIME - 1000) {
            clearTimeout(countDown);
            sendEnable($send, originValue);
            setCookie('clickTime', '', new Date(0));
        }
        else {
            sendDisable($send, Date.now(), DELAYTIME);
        }
    }, 200);
}

$(function () {
    // 切换注册方式
    $('.another-way').click(function (e) {
        $this = $(this);
        $this.parents('[class|="way"]').hide();
        $('.way-' + $this.data('way')).show();

        e.preventDefault();
    });

    // 发送按钮倒计时
    var $send = $('.send');
    var DELAYTIME = 60000;  // 1min
    var originValue = $send.val();

    // 页面加载完成时获取发送按钮情况
    if (getCookie('clickTime')) {
        console.log(getCookie('clickTime'));
        console.log('get click time');
        sendDisable($send, Date.now(), DELAYTIME);
        setCountDown($send, originValue, DELAYTIME);
    }

    $send.click(function () {
        var $this = $(this);

        if ($this.hasClass('disabled')) return;

        setCookie('clickTime', Date.now());
        // 发送请求
        // ...

        setCountDown($this, originValue, DELAYTIME);
    });
});