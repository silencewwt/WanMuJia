$(function () {
    
    var RESULTURL = "/register_finish";

    var submitlUrl = "/register_next";

    var $nickname = $("#nickname");
    var $password = $("#password");
    var $confirmPwd = $("#confirm_pwd");

    var $csrf_token = $("#csrf_token");

    var $submitReg = $("#submit_reg");

    var $nicknameErrTip = $(".err-tip.nickname");
    var $passwordErrTip = $(".err-tip.password");
    var $confirmPwdErrTip = $(".err-tip.confirm_pwd");
    var $resultErrTip = $(".err-tip.result");



    $nickname.blur(function() {
        checkNickname();
    });
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
        if(!checkNickname()) return;
        if(!checkPassword()) return;
        if(!checkConfirmPsw()) return;

        $.ajax({
            type: "POST",
            url: submitlUrl,
            data: {csrf_token: $csrf_token.val(),nickname: $nickname.val() , password: encrypt($password.val()) , confirm_password: encrypt($confirmPwd.val())},
            success: function(data) {
                if(data.success) {
                    //
                    $resultErrTip.fadeIn('100').text("注册成功");
                    window.href.location = RESULTURL;
                } else {
                    $resultErrTip.fadeIn('100').text(data.message);
                }
            },
            error: function(xhr, status, err) {
		        console.error(submitlUrl, status, err.toString());
		    }
        });

    });

    function checkNickname() {
        var nicknameStr = $nickname.val();
        if(nicknameStr.length === 0) {
            // 昵称不能为空
            $nicknameErrTip.fadeIn('100').text("昵称不能为空");
            return false;
        } else if(nicknameStr.length < 4) {
            // 昵称不能小于4
            $nicknameErrTip.fadeIn('100').text("昵称不能小于4个字符");
            return false;
        } else if(nicknameStr.length > 30) {
            // 昵称不能大于30
            $nicknameErrTip.fadeIn('100').text("昵称不能大于30个字符");
            return false;
        }
        //
        $nicknameErrTip.fadeOut('50').text(" ");
        return true;
    }

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
