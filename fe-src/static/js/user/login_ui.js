$(function() {

    //  获取下一步链接
    var NEXTURL = "/";
    var urlSearch = window.location.search;
    NEXTURL = urlSearch.substr(urlSearch.indexOf("next")+5);



    var $username = $("#username");
    var $password = $("#password");
    var $next = $("#next");
    var $csrf_token = $("#csrf_token");

    var loginUrl = $('form').attr('action');

    var $usernameErrTip = $(".err-tip.username");
    var $pswErrTip = $(".err-tip.psw");
    var $resultErrTip = $(".err-tip.result");

    $username.change(function() {
        $usernameErrTip.hide().text('');
        $resultErrTip.hide().text('');
    });
    $password.change(function() {
        $pswErrTip.hide().text('');
        $resultErrTip.hide().text('');
    });

    $next.click(function(e) {
        e.preventDefault();

        $usernameErrTip.hide().text('');
        $pswErrTip.hide().text('');
        $resultErrTip.hide().text('');

        if($username.val().length === 0) {
            // 用户名或者。。。不能为空
            $usernameErrTip.fadeIn('50').text('用户名/手机/邮箱不能为空');
            return false;
        }
        if($password.val().length === 0) {
            // 密码不能为空
            $pswErrTip.fadeIn('50').text('密码不能为空');
            return false;
        }
        $(this).attr("disabled" , true);
        $.ajax({
            type: "POST",
            url: loginUrl,
            data: {csrf_token: $csrf_token.val() , username: $username.val() , password: encrypt($password.val())},
            success: function(data) {
                $next.removeAttr("disabled");
                if(data.success) {
                    $resultErrTip.fadeIn().text("登录成功");
                    window.location.href = NEXTURL;
                } else {
                    $resultErrTip.fadeIn('50').text(data.message);
                }
            },
            error: function(xhr, status, err) {
		        console.error(loginUrl, status, err.toString());
		    }
        });
    });
});
