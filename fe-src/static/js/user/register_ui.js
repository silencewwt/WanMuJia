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

// 验证手机号码格式
function isMobilePhone(phoneNum) {
    var patrn = /^1\d{10}$/;
    if (!patrn.exec(phoneNum)) {
        return false;
    }
    return true;
}
// 验证邮箱格式
function isEmail(email) {
    var patrn = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (!patrn.test(email)) {
        return false;
    }
    return true;
}


$(function () {

    var NEXTURL = "/register_next";

    var sendVerUrl = "/service/mobile_register_sms";
    var mobileNextUrl = "/register";
    var sendEmailUrl = "/service/send_email?type=USER_REGISTER";

    var $mobilephone = $("#mp");
    var $verify = $("#verify");
    var $email = $("#email");
    var $agreement = $("#agreement");
    var $csrf_token = $("#csrf_token");

    var $mpErrTip = $(".err-tip.mp");
    var $verErrTip = $(".err-tip.ver");
    var $emailErrTip = $(".err-tip.email");
    var $agreementErrTip = $(".err-tip.agreement");

    var $agreementCli = $(".agreement");

    var $next = $("#next");
    var $send = $('.send');
    var $sendEmail = $("#sendEmail");


    // 发送按钮倒计时
    var DELAYTIME = 60000;  // 1min
    var originValue = $send.val();

    // 页面加载完成时获取发送按钮情况
    if (getCookie('clickTime')) {
        // console.log(getCookie('clickTime'));
        // console.log('get click time');
        sendDisable($send, Date.now(), DELAYTIME);
        setCountDown($send, originValue, DELAYTIME);
    }
    // 切换注册方式
    $('.another-way').click(function (e) {
        $this = $(this);
        $this.parents('[class|="way"]').hide();
        $('.way-' + $this.data('way')).show();
        e.preventDefault();
    });
    // 手机号码输入框失焦的时候
    $mobilephone.blur(function() {
        checkMP();
    });
    // 发送验证码。
    $send.click(function () {
        if(!checkMP()) return;
        var $this = $(this);
        if ($this.hasClass('disabled')) return;

        // 发送请求
        $.ajax({
            type: "POST",
            url: sendVerUrl,
            data: {mobile: $mobilephone.val()},
            success: function(data) {
                if(data.success) {
                    // 发送验证码成功
                    setCookie('clickTime', Date.now());
                    setCountDown($this, originValue, DELAYTIME);
                } else {
                    $mpErrTip.fadeIn('100').text(data.message);
                }
            },
            error: function(xhr, status, err) {
		        console.error(sendVerUrl, status, err.toString());
		    }
        });
        //
    });
    // 验证码输入框失焦的时候
    $verify.blur(function() {
        checkVerify();
    });
    // 选择服务条例
    $agreement.change(function() {
        var ischecked = $agreement.is(':checked');
        if(ischecked) {
            $agreementErrTip.text(" ").fadeOut('50');
        }
    });
    // 下一步
    $next.click(function(e) {
        e.preventDefault();
        // 验证手机号
        if(!checkMP()) return false;
        if(!checkVerify()) return false;
        if(!checkAgreement()) return false;
        $.ajax({
            type: "POST",
            url: mobileNextUrl,
            data: {mobile: $mobilephone.val(),captcha: $verify.val(),csrf_token: $csrf_token.val()},
            success: function(data) {
                if(data.success) {
                    // 发送验证码成功
                    window.location.href = NEXTURL;
                } else {
                    $mpErrTip.fadeIn('100').text(data.message);
                }
            },
            error: function(xhr, status, err) {
		        console.error(mobileNextUrl, status, err.toString());
		    }
        });
    });
    // 邮箱输入框失焦的时候
    $email.blur(function() {
        checkEmail();
    });
    $sendEmail.click(function(e) {
        e.preventDefault();
        if(!checkEmail()) return;
        $.ajax({
            type: "POST",
            url: sendEmailUrl,
            data: {email: $email.val(),csrf_token: $csrf_token.val()},
            success: function(data) {
                if(data.success) {
                    // 发送验证码成功
                    $emailErrTip.fadeIn('100').text("邮件发送成功");
                } else {
                    $emailErrTip.fadeIn('100').text(data.message);
                }
            },
            error: function(xhr, status, err) {
		        console.error(sendEmailUrl, status, err.toString());
		    }
        });
    });

    // 检验手机号码函数
    function checkMP() {
        var pNum = $mobilephone.val();
        if(pNum.length === 0) {
            $mpErrTip.fadeIn('100').text('请输入手机号码');
            return false;
        }
        if(!isMobilePhone(pNum)) {
            $mpErrTip.fadeIn('100').text('请输入正确的手机号码');
            return false;
        }
        $mpErrTip.text(" ").fadeOut('50');
        return true;
    }
    // 验证验证码
    function checkVerify() {
        var verifyNum = $verify.val();
        if(verifyNum.length === 0) {
            $verErrTip.fadeIn('100').text('请输入验证码');
            return false;
        }
        $verErrTip.text(" ").fadeOut('50');
        return true;
    }
    // 验证邮箱
    function checkEmail() {
        var emailStr = $email.val();
        if(emailStr.length === 0) {
            $emailErrTip.fadeIn('100').text('请输入邮箱');
            return false;
        }
        if(!isEmail(emailStr)) {
            $emailErrTip.fadeIn('100').text('请输入正确的邮箱地址');
            return false;
        }
        $emailErrTip.text(" ").fadeOut('50');
        return true;
    }
    // 验证服务协议是否被选中
    function checkAgreement() {
        var ischecked = $agreement.is(':checked');
        if(ischecked) {
            $agreementErrTip.text(" ").fadeOut('50');
            return true;
        }
        $agreementErrTip.fadeIn('100').text('请选择同意万木家服务协议');
        return false;
    }
});
