function btnLoading($btn) {
    $btn.attr("disabled" , true);
    $btn.val("Loading...");
}
function btnClearLoading($btn , text) {
    $btn.attr("disabled" , false);
    $btn.val(text);
}

$(function () {

    var RESULTURL = "/login";

    var submitlUrl = "/register_next";

    var $password = $("#password");
    var $confirmPwd = $("#confirm_pwd");

    var $csrf_token = $("#csrf_token");

    var $submitReg = $("#submit_reg");

    var $passwordErrTip = $(".err-tip.password");
    var $confirmPwdErrTip = $(".err-tip.confirm_pwd");
    var $resultErrTip = $(".err-tip.result");

    $password.blur(function() {
        if(checkPassword() && $confirmPwd.length > 0) {
            checkConfirmPsw();
        }
    });
    $confirmPwd.blur(function() {
        checkConfirmPsw();
    });

    $submitReg.click(function(e) {
        e.preventDefault();
        $resultErrTip.fadeOut('50').text(" ");
        if(!checkPassword()) return;
        if(!checkConfirmPsw()) return;

        var _this = $(this);
        var _text = _this.val();
        btnLoading(_this);
        $.ajax({
            type: "POST",
            url: submitlUrl,
            data: {csrf_token: $csrf_token.val(), password: encrypt($password.val()) , confirm_password: encrypt($confirmPwd.val())},
            success: function(data) {
                if(data.success) {
                    $resultErrTip.fadeIn('100').text("重置成功,将返回登录页面");
                    setTimeout(function() {
                        window.location.href = RESULTURL;
                    } , 1000);
                } else {
                    btnClearLoading(_this , _text);
                    $resultErrTip.fadeIn('100').text(data.message);
                }
            },
            error: function(xhr, status, err) {
		        console.error(submitlUrl, status, err.toString());
		    }
        });

    });

    function checkPassword() {
        var passwordStr = $password.val();
        if(passwordStr.length === 0) {
            // 请输入密码
            $passwordErrTip.fadeIn('100').text("请输入密码");
            return false;
        } else if(passwordStr.length < 6) {
            // 密码至少6位
            $passwordErrTip.fadeIn('100').text("密码至少6位");
            return false;
        } else if(passwordStr.length > 32) {
            // 密码不超过32位
            $passwordErrTip.fadeIn('100').text("密码不超过32位");
            return false;
        }
        //
        $passwordErrTip.fadeOut('50').text(" ");
        return true;
    }

    function checkConfirmPsw() {
        var passwordStr = $password.val();
        var conPswStr = $confirmPwd.val();
        if(passwordStr != conPswStr) {
            // 两次密码不一致
            $confirmPwdErrTip.fadeIn('100').text("两次密码不一致");
            return false;
        }
        //
        $confirmPwdErrTip.fadeOut('50').text(" ");
        return true;
    }

});
