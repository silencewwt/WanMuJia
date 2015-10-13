$(function() {
    redirectLogin();
});
function redirectLogin() {
    var $login_link = $("#login");
    var now_pathname = window.location.pathname;
    if(now_pathname.indexOf('login') !== -1) {
        $login_link.attr("href" , window.location.href);
        return ;
    }
    if(now_pathname.indexOf('register') !== -1) {
        $login_link.attr("href" , $login_link.attr("href") + "?next=" + "/");
        return ;
    }
    $login_link.attr("href" , $login_link.attr("href") + "?next=" + now_pathname);
    return ;
}
