// profile_ui

var Item = React.createClass({
  getInitialProps: function() {
    return {
      // item: {
      //   item_id: 20,
      //   item: "名字",
      //   image_url: ""
      //   price: "2000",
      //   deleted: 0
      // }
    };
  },
  render: function() {
    var dialogStyle = {
      display: this.props.item.deleted ? "none" : "block"
    };
    return (
      <div class="item">
        <a href={"/item?id=" + this.props.item.item_id}></a>
        <img src={this.props.image_url} alt={this.props.item.item} />
        <span class="del glyphicon glyphicon-trash"></span>
        <div class="dialog" style={dialogStyle}>
          <div class="info">
            <p>确定删除吗？</p>
            <div class="btn-group">
                <button class="confirm">确认</button>
                <button class="cancle">取消</button>
            </div>
          </div>
        </div>
        <div class="item-info">
          <h5><a href="/item?id={{ item.id }}">{this.props.item.item}</a></h5>
          <div class="price">&yen; {this.props.item.price}</div>
        </div>
      </div>
    );
  }
});

var Items = React.createClass({
  getInitialState: function() {
    return {
      collections: [
        {
          item_id: 10,
          item: "名字1",
          image_url: "",
          price: "2300",
          deleted: 0
        }, {
          item_id: 20,
          item: "名字2",
          image_url: "",
          price: "2000",
          deleted: 0
        }
      ]
    };
  },
  setCollection: function(collections) {
    this.setState({
      collections: collections
    });
  },
  render: function() {
    return (
      <div class="item-wrapper clearfix">
        this.state.collections.map(function (item, i) {
            <Item item={item} />
        })
      </div>
    );
  }
});

function getItems(page, callback) {
  page = page || 1;
  $.get("/collection", {
    page: page
  }, callback);
}

function init() {
  // 锚点
  var hash = window.location.hash.slice(1) ? window.location.hash.slice(1) : 'collections';
  $('.tabs').children('[data-tab=' + hash + ']').addClass('active');
  $('.tab-content').children('.' + hash).removeClass('hide');

  // 确认删除dialog屏蔽原本的商品跳转链接
  $('.collections').delegate('.dialog', 'click', function(e) {
    e.preventDefault(); // 为什么 stopPropagation 无效？
  });

  $('.collections .del').click(function(e) {
    var $dialog = $(this).parent().find('.dialog');
    $dialog.addClass('dialog-confirm').css('display', 'block');
    e.preventDefault();
  });

  $('.dialog .cancle').click(function() {
    var $dialog = $(this).parents('.dialog');
    $dialog.removeClass('dialog-confirm').hide();
  });

  $('.dialog .confirm').click(function(e) {
    $(this).parents('.item').remove();
    e.preventDefault();

    // 发送删除收藏的ajax请求
  });

}

function settingInit() {
  // 验证
  $('.verified').on('input', function() {
    var text = $(this).val();
    var type, formTip;
    if($(this).attr('name') === 'nickname') {
      formTip = checkInfo(text, 'nickname');
    } else if($(this).attr('type') === 'password') {
      formTip = checkInfo(text, 'userPassword');
    } else if ($(this).attr('name') === 'phone') {
      formTip = checkInfo(text, 'mobile');
    } else if ($(this).attr('name') === 'verify') {
      formTip = checkInfo(text, 'captcha');
    } else if ($(this).attr('name') === 'email') {
      formTip = checkInfo(text, 'email');
    } else {
      formTip = '';
    }
    setFormTip(this, formTip);
  });

  // 账户设置提交
  $('#settingSubmit').click(function(e) {
    e.preventDefault();
    var nickname = $('#nickname').val();
    var formInfo = $(this).parent().prev().text();
    if(!nickname) {
      setFormTip(this, '昵称不能为空');
    } else if(!formInfo) {
      $.post(
        '/settings',
        {
          nickname: nickname,
          csrf_token: ''
        },
        function(data) {
          if(data.success) {
            setFormTip(this, '修改成功', true);
          } else {
            setFormTip(this, data.message);
          }
        }.bind(this));
    }
  });

  // 修改密码
  $('#pwdSubmit').click(function(e) {
    e.preventDefault();
    var oriPwd = $('#oriPwd').val();
    var newPwd = $('#newPwd').val();
    var conPwd = $('#conPwd').val();
    var formInfo = $(this).parent().prev().text();
    if(!oriPwd || !newPwd || !conPwd) {
      setFormTip(this, '密码不能为空');
    } else if(newPwd !== conPwd) {
      setFormTip(this, '两次密码输入不同');
    } else if(!formInfo) {
      $.post(
        '/change_password',
        {
          old_password: encrypt(encrypt(oriPwd)),
          new_password: encrypt(encrypt(newPwd)),
          confirm_password: encrypt(encrypt(conPwd)),
          csrf_token: ''
        },
        function(data) {
          if(data.success) {
            setFormTip(this, '修改成功', true);
          } else {
            setFormTip(this, data.message);
            console.log(data.message);
          }
        }.bind(this));
    }
  });

  // 发送验证码
  $('.send-verify').click(function(e) {
    e.preventDefault();
    var mobile = $('#newmobile').val();
    var formInfo = checkInfo(mobile, 'mobile');
    if(!mobile) {
      setFormTip(this, '密码不能为空');
    } else if(formInfo) {
      setFormTip(this, formInfo);
    } else if(!formInfo) {
      $.post(
        '/service/mobile_register_sms',
        {
          mobile: mobile,
          csrf_token: ''
        },
        function(data) {
          if(data.success) {
            setFormTip(this, '验证码已发送', true);
          } else {
            setFormTip(this, data.message);
          }
        }.bind(this));
    }
  });

  // 绑定手机
  $('#phoneSubmit').click(function(e) {
    e.preventDefault();
    var mobile = $('#mobile').val();
    var verify = $('#newverify').val();
    var formInfo = $(this).parent().prev().text();
    if(!mobile) {
      setFormTip(this, '手机号码不能为空');
    } else if(!verify) {
      setFormTip(this, '验证码不能为空');
    } else if(!formInfo) {
      $.post(
        '/settings',
        {
          mobile: mobile,
          captcha: verify,
          csrf_token: ''
        },
        function(data) {
          if(data.success) {
            alert('绑定成功');
            window.location.reload();
          } else {
            setFormTip(this, data.message);
          }
        }.bind(this));
    }
  });

  // 绑定邮箱
  $('#emailSubmit').click(function(e) {
    e.preventDefault();
    var email = $('#newemail').val();
    var formInfo = $(this).parent().prev().text();
    if(!email) {
      setFormTip(this, '邮箱不能为空');
    } else if(!formInfo) {
      $.post(
        '/service/send_email?type=USER_EMAIL_CONFIRM',
        {
          role: 'user',
          email: email,
          csrf_token: ''
        },
        function(data) {
          if(data.success) {
            setFormTip(this, '请前往邮箱确认绑定', true);
          } else {
            setFormTip(this, data.message);
          }
        }.bind(this));
    }
  });
}

$(function() {
  init();
  settingInit();

  var currentPage = 1;
  var items = React.render(
    <Items />,
    document.getElementById('collections')
  );
  getItems(currentPage, function(data) {
    items.setCollection(data.collections);
  });
});

function setFormTip(submitEle, text, success) {
  var $formTip = $(submitEle).parents('form').children('.form-tip');
  $formTip.text(text);
  if(success) {
    $formTip.addClass('success');
  } else {
    $formTip.removeClass('success');
  }
}

function checkInfo(text, type) {
  var regExps = getRegs();
  var typeHash = {
    mobile: '手机号码格式不正确，请重新输入',
    email: '邮箱格式不正确，请重新输入',
    userPassword: '密码为6-16位的数字、字母或_.的组合',
    captcha: '验证码格式不正确',
    nickname: '昵称必须为4-30位的中文、字母和数字组合，且不能全是数字'
  };
  if (!regExps[type].test(text)) {
    return typeHash[type];
  } else {
    return '';
  }
}
