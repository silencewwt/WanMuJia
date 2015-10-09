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

    $('.verified').on('input', function() {
      var id = $(this).attr('id');
      var checkTip = checkInfo(id);
      if(checkTip) {
        $('.form-tip').text(checkTip);
      } else {
        $('.form-tip').text("");
      }
    });

    $('#settingSubmit').click(function(e) {
      var checkTip = checkInfo();
      if(checkTip) {
        $('.form-tip').text(checkTip);
        e.preventDefault();
      }
    });
}

function checkInfo(id) {
  var regExps = getRegs();
  var idHash = {
    mobile: "手机号码",
    email: "邮箱"
  };
  if(id) {
    var value = $('#'+id).val();
    if(value && !regExps[id].test(value)) {
      return idHash[id] + "格式不正确，请重新输入";
    }
    return;
  } else {
    for(var k in idHash) {
      var checkTip = checkInfo(k);
      if(checkTip) {
        return checkTip;
        break;
      }
    }
  }
}

$(function () {
    init();
});
