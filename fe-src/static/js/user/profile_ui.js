// profile_ui

function init() {
    // 确认删除dialog屏蔽原本的商品跳转链接
    $('.collections').delegate('.dialog', 'click', function (e) {
        e.preventDefault(); // 为什么 stopPropagation 无效？
    });

    $('.collections .del').click(function (e) {
        var $dialog = $(this).parent().find('.dialog');
        $dialog.addClass('dialog-confirm').css('display', 'block');
        e.preventDefault();
    });

    $('.dialog .cancle').click(function () {
        var $dialog = $(this).parents('.dialog');
        $dialog.removeClass('dialog-confirm').hide();
    });

    $('.dialog .confirm').click(function (e) {
        $(this).parents('.item').remove();
        e.preventDefault();

        // 发送删除收藏的ajax请求
    });
}

$(function () {
    init();
});