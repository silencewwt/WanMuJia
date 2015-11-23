'use strict';

//  ==================================================
//  Component: Security
//
//  Props:
//
//  State:
//
//  Use: views::Profile
//
//  TODO: [add] 表单验证
//        [add] 各种交互逻辑
//  ==================================================

let Utils = require('../../../../lib/utils/utils');
let Ajax = require('reqwest');

let rules = { // 表单验证规则
  phone: {
    rule: Utils.getRegs('mobile'),
    text: '请输入正确的手机号码'
  },
  verify: {
    rule: Utils.getRegs('captcha'),
    text: '请输入正确的验证码'
  },
  username: {
    rule: Utils.getRegs('nickname'),
    text: '请输入正确的会员名'
  },
  email: {
    rule: Utils.getRegs('email'),
    text: '请输入正确的邮箱'
  },
  password: {
    rule: Utils.getRegs('userPassword'),
    text: '请输入正确的密码'
  }
};

let Validate = require('./Validate/Validate.jsx');

let Security = React.createClass({
  render: function() {
    return (
      <div className="security">
        <SecTitle />
        <SecMain />
      </div>
    );
  }
});

let SecTitle = React.createClass({
  render: function() {
    return (
      <div className="sec-title">
        <h2>
          基本信息
        </h2>
      </div>
    );
  }
});

let SecMain = React.createClass({
  getInitialState: function() {
    return {
      active: null,
      timeLeft: parseInt(Utils.getCookie('profile_time_left')) || 0
    };
  },
  getDefaultProps: function() {
    return {
      mainHd: [ // 折叠面板 header 内容
        {
          title: '会员名：',
          text: 'username',
          btn: '修改',
          type: 'username'
        }, {
          title: '手机号：',
          text: 'phone',
          btn: null,
          type: null
        }, {
          title: '邮箱：',
          text: 'email',
          btn: '绑定邮箱',
          type: 'email'
        }, {
          title: '密码：',
          text: '×××××××××',
          btn: '修改密码',
          type: 'password'
        }
      ]
    };
  },
  handleHdClick: function(index, btn) { // 折叠控制
    if(!btn) {
      return;
    }

    if(index === this.state.active) {
      index = null;
    }

    this.setState({
      active: index
    });
  },
  sendVerify: function(phone, ref) {
    let _this = this;
    if(this.state.timeLeft) {
      return;
    } else {
      Ajax({  // 发送验证码
        url: '/service/mobile_sms?type=USER_CHANGE_USERNAME',
        method: 'post',
        data: {
          csrf_token: Utils.getCookie('csrf_token'),
          mobile: phone
        },
        success: function (res) {
          if(res.success) {
            ref.setTip('发送成功，请查收', 'success');
            _this.setState({
              timeLeft: 60
            });
            (!_this.timer) && _this.setTimer();
          }
        }
      })
    }
  },
  setTimer: function() {
    let now = new Date();
    now.setSeconds(now.getSeconds() + 60);

    this.timer = setInterval(function() {
      let nextTimeLeft = --this.state.timeLeft;
      this.setState({
        timeLeft: nextTimeLeft
      });
      Utils.setCookie('profile_time_left', nextTimeLeft, now, '/profile');
      if(nextTimeLeft === 0) {
        clearInterval(this.timer);
        this.timer = 0;
      }
    }.bind(this), 1000);
  },
  render: function() {
    if (!this.timer && this.state.timeLeft > 0) {
      this.setTimer();
    }

    return (
      <div className="sec-main">
        {this.props.mainHd.map((item, i) => {
          return (
            <div className="main-content" key={i}>
              <SecMainHd
                item={item}
                onClick={this.handleHdClick.bind(null, i)}
                active={this.state.active === i}
              />
              {
                this.state.active === i ?
                <SecMainBd
                  item={item}
                  timeLeft={this.state.timeLeft}
                  sendVerify={this.sendVerify}
                /> :
                null
              }
            </div>
          );
        })}
      </div>
    );
  }
});

let SecMainHd = React.createClass({
  render: function() {
    return (
      <div
        className="main-hd"
        onClick={this.props.onClick.bind(null, this.props.item.btn)}
        title={this.props.item.btn ? '点击' + this.props.item.btn : null}
      >
        <span className="main-hd-title">
          {this.props.item.title}
        </span>
        <span className="main-hd-text">
          {this.props.item.text}
        </span>
        <span className="main-hd-btn" >
          {
            this.props.active ?
            '收起' :
            this.props.item.btn
          }
        </span>
      </div>
    );
  }
});

let SecMainBd = React.createClass({
  render: function() {
    let bdInstance;

    switch (this.props.item.type) {
      case 'username':
        bdInstance = <UsernameBd
          timeLeft={this.props.timeLeft}
          sendVerify={this.props.sendVerify}
        />;
        break;
      case 'email':
        bdInstance = <EmailBd
          timeLeft={this.props.timeLeft}
          sendVerify={this.props.sendVerify}
       />;
        break;
      case 'password':
        bdInstance = <PasswordBd
          timeLeft={this.props.timeLeft}
          sendVerify={this.props.sendVerify}
        />;
        break;
      default:
        bdInstance = null;
        return null;
    }

    return (
      <div className="main-bd">
        {bdInstance}
      </div>
    );
  }
});

let UsernameBd = React.createClass({
  handleSbtClick: function() {
    let phone = this.refs.refPhone.getValue();
    let verify = this.refs.refVerify.getValue();
    let username = this.refs.refName.getValue();
    if(phone  === '') {
      this.refs.refPhone.setTip('手机号码不能为空');
    }
    if(verify  === '') {
      this.refs.refVerify.setTip('验证码不能为空');
    }
    if(username  === '') {
      this.refs.refName.setTip('会员名不能为空');
    }

    phone && verify && username && (function() {
      console.log({
        phone,
        verify,
        username
      });
      this.refs.usName.setTip('success', 'success');
    }.bind(this))();
  },
  handleVerifyClick: function() {
    let phone = this.refs.refPhone.getValue();
    if(!phone) {
      if(phone  === '') {
        this.refs.refPhone.setTip('手机号码不能为空');
      }
      return;
    }

    this.props.sendVerify(phone, this.refs.refVerify);
  },
  render: function() {
    return (
      <form>
        <Validate
          placeholder='请输入你的手机号'
          ref="refPhone"
          validate={rules.phone}
        />
        <Validate
          placeholder='请输入短信验证码'
          ref="refVerify"
          theme="verify"
          validate={rules.verify}
        >
          <button
            type="button"
            className={this.props.timeLeft ? 'disabled' : null}
            onClick={this.handleVerifyClick}
          >
            {
              this.props.timeLeft ?
              this.props.timeLeft + 's 后可重发' :
              '获取短信验证码'
            }
          </button>
        </Validate>
        <Validate
          placeholder='请输入新会员名'
          ref="refName"
          validate={rules.username}
        />
        <button
          type="button"
          className="username-sbt"
          onClick={this.handleSbtClick}
        >
          修改
        </button>
      </form>
    );
  }
});

let EmailBd = React.createClass({
  handleSbtClick: function() {
    let phone = this.refs.refPhone.getValue();
    let verify = this.refs.refVerify.getValue();
    let email = this.refs.refEmail.getValue();
    if(phone  === '') {
      this.refs.refPhone.setTip('手机号码不能为空');
    }
    if(verify  === '') {
      this.refs.refVerify.setTip('验证码不能为空');
    }
    if(email  === '') {
      this.refs.refEmail.setTip('邮箱不能为空');
    }

    phone && verify && email && console.log({
      phone,
      verify,
      email
    });
  },
  handleVerifyClick: function() {
    let phone = this.refs.refPhone.getValue();
    if(!phone) {
      if(phone  === '') {
        this.refs.refPhone.setTip('手机号码不能为空');
      }
      return;
    }

    this.props.sendVerify(phone, this.refs.refVerify);
  },
  render: function() {
    return (
      <form>
        <Validate
          placeholder='请输入你的手机号'
          ref="refPhone"
          validate={rules.phone}
        />
        <Validate
          placeholder='请输入短信验证码'
          ref="refVerify"
          theme="verify"
          validate={rules.verify}
        >
          <button
            type="button"
            className={this.props.timeLeft ? 'disabled' : null}
            onClick={this.handleVerifyClick}
          >
            {
              this.props.timeLeft ?
              this.props.timeLeft + 's 后可重发' :
              '获取短信验证码'
            }
          </button>
        </Validate>
        <Validate
          placeholder='请输入邮箱地址'
          ref="refEmail"
          validate={rules.email}
        />
        <button
          type="button"
          className="email-sbt"
          onClick={this.handleSbtClick}
        >
          发送验证邮件
        </button>
      </form>
    );
  }
});

let PasswordBd = React.createClass({
  handleSbtClick: function() {
    let currPwd = this.refs.refPwd.getValue();
    let newPwd = this.refs.refNewpwd.getValue();
    let conPwd = this.refs.refConfirmpwd.getValue();
    if(currPwd === '') {
      this.refs.refPwd.setTip('密码不能为空');
    }
    if(newPwd  === '') {
      this.refs.refNewpwd.setTip('密码不能为空');
    }
    if(conPwd  === '') {
      this.refs.refConfirmpwd.setTip('密码不能为空');
    }

    currPwd && newPwd && conPwd && this.changePassword(currPwd, newPwd, conPwd);
  },
  changePassword: function(currPwd, newPwd, conPwd) {
    let _this = this;
    Ajax({  // 修改密码
      url: '/change_password',
      method: 'post',
      data: {
        csrf_token: Utils.getCookie('csrf_token'),
        old_password: Utils.encryptMd5(currPwd),
        new_password: Utils.encryptMd5(newPwd),
        confirm_password: Utils.encryptMd5(conPwd)
      },
      success: function (res) {
        if(res.success) {
          _this.refs.refConfirmpwd.setTip(':) 密码修改成功，请重新登录', 'success');
        } else {
          _this.refs.refConfirmpwd.setTip(':( 密码修改失败，请重试', 'tip');
        }
      }
    })
  },
  render: function() {
    return (
      <form>
        <Validate
          placeholder='当前密码'
          ref="refPwd"
          validate={rules.password}
        />
        <Validate
          placeholder='新密码'
          ref="refNewpwd"
          validate={rules.password}
          tip={{
            status: 'success',
            text: '6-16 位，大小写字母、数字及 \"\_\" 、 \"\.\" 的组合'
          }}
        />
        <Validate
          placeholder='新密码'
          ref="refConfirmpwd"
          validate={rules.password}
        />
        <button
          type="button"
          className="username-sbt"
          onClick={this.handleSbtClick}
        >
          确认修改
        </button>
      </form>
    );
  }
});



module.exports = Security;
