'use strict';

//  ==================================================
//  Component: Security
//
//  Props:  userInfo => object|null 用户登录信息
//
//  State:  SecMain:: active => null|integer 激活的折叠面板
//                    timeLeft => integer 短信倒计时
//                    mainHdText => array 折叠面板 Header 文字
//                    usernameRevisable => boolean 会员名是否可修改
//                    emailConfirmed => boolean 邮箱是否验证
//
//  Dependence: lib::utils npm::reqwest Profile::Security::Validate
//
//  Use: views::Profile
//
//  TODO:
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
    text: '会员名为大小写字母、数字或"_"的组合'
  },
  email: {
    rule: Utils.getRegs('email'),
    text: '请输入正确的邮箱'
  },
  password: {
    rule: Utils.getRegs('userPassword'),
    text: '6-16 位，大小写字母、数字及 "_" 、"." 的组合'
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
      active: null, // 激活的折叠面板
      timeLeft: parseInt(Utils.getCookie('profile_time_left')) || 0,  // 短信倒计时
      mainHdText: [], // 折叠面板 Header 文字
      usernameRevisable: true // 会员名是否可修改
    };
  },
  getDefaultProps: function() {
    return {
      mainHd: [ // 折叠面板 header 内容
        {
          title: '会员名：',
          btn: '修改（只能修改一次）',
          type: 'username'
        }, {
          title: '手机号：',
          btn: null,
          type: null
        }, {
          title: '邮箱：',
          btn: '绑定邮箱',
          type: 'email'
        }, {
          title: '密码：',
          btn: '修改密码',
          type: 'password'
        }
      ]
    };
  },
  componentWillMount: function() {
    let _this = this;
    Ajax({  // 获取个人信息
      url: '/logined',
      method: 'get',
      success: function (res) {
        if(res.logined) {
          _this.setState({
            mainHdText: [
              res.username,
              res.mobile,
              res.email,
              '• • • • • •'
            ],
            usernameRevisable: res.username_revisable,
            emailConfirmed: res.email_confirmed
          });
        }
      }
    })
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
        url: '/service/mobile_sms_login_required?type=USER_SMS_CAPTCHA',
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
                text={this.state.mainHdText[i]}
                onClick={this.handleHdClick.bind(null, i)}
                active={this.state.active === i}
                usernameRevisable={this.state.usernameRevisable}
              />
              {
                this.state.active !== i || (!this.state.usernameRevisable && i === 0) ?
                null :
                <SecMainBd
                  item={item}
                  timeLeft={this.state.timeLeft}
                  sendVerify={this.sendVerify}
                  usernameRevisable={this.state.usernameRevisable}
                  emailConfirmed={this.state.emailConfirmed}
                  phone={this.state.mainHdText[1]}
                  email={this.state.mainHdText[2]}
                />
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
    let btnText;
    if(!this.props.usernameRevisable && this.props.item.type === 'username') {
      btnText = '您已修改过会员名，现在无法修改';
    } else if (this.props.active) {
      btnText = '收起';
    } else if (this.props.item.type === 'email' && this.props.text) {
      btnText = '修改邮箱';
    } else {
      btnText = this.props.item.btn;
    }

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
          {this.props.text}
        </span>
        <span className="main-hd-btn" >
          {btnText}
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
          phone={this.props.phone}
        />;
        break;
      case 'email':
        bdInstance = <EmailBd
          timeLeft={this.props.timeLeft}
          sendVerify={this.props.sendVerify}
          emailConfirmed={this.props.emailConfirmed}
          phone={this.props.phone}
          email={this.props.email}
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

    phone && verify && username && this.changeUsername(username, verify);
  },
  changeUsername: function(username, verify) {
    let _this = this;
    Ajax({  // 修改会员名
      url: '/settings?type=USER_USERNAME_SETTING',
      method: 'post',
      data: {
        csrf_token: Utils.getCookie('csrf_token'),
        username: username,
        captcha: verify
      },
      success: function (res) {
        if(res.success) {
          _this.refs.refName.setTip(':) 修改成功', 'success');
          setTimeout(function() {
            window.location.reload();
          }, 1000);
        } else {
          _this.refs.refName.setTip(':( ' + res.message, 'tip');
        }
      }
    })
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
          value={this.props.phone}
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
  getInitialState: function() {
    return {
      sendEmailTip: null
    };
  },
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

    phone && verify && email && this.changeEmail(email, verify);
  },
  changeEmail: function(email, verify) {
    let _this = this;
    Ajax({  // 修改邮箱
      url: '/settings?type=USER_EMAIL_SETTING',
      method: 'post',
      data: {
        csrf_token: Utils.getCookie('csrf_token'),
        email: email,
        captcha: verify
      },
      success: function (res) {
        if(res.success) {
          _this.refs.refEmail.setTip(':) 修改成功，请到邮箱中确认绑定', 'success');
        } else {
          _this.refs.refEmail.setTip(':( ' + res.message, 'tip');
        }
      }
    })
  },
  sendEmail: function(email) {
    let _this = this;
    Ajax({  // 发送邮箱验证
      url: '/service/send_email?type=USER_EMAIL_CONFIRM',
      method: 'post',
      data: {
        csrf_token: Utils.getCookie('csrf_token'),
        role: 'user',
        email: email
      },
      success: function (res) {
        if(res.success) {
          _this.setState({
            sendEmailTip: '发送成功。请查收 :)'
          });
        } else {
          _this.setState({
            sendEmailTip: ':( 发送失败。' + res.message
          });
        }
      }
    })
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
        (this.props.emailConfirmed || !this.props.email) ?
        <form>
          <Validate
            placeholder='请输入你的手机号'
            ref="refPhone"
            validate={rules.phone}
            value={this.props.phone}
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
                this.props.timeLeft + '秒后再次发送' :
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
        </form> :
        <form>
          <div
            style={{
              marginBottom: '20px',
              textAlign: 'center',
              color: '#666'
            }}
          >
            验证邮件已发送至邮箱，请查收
          </div>
          <div
            style={{
              marginBottom: '20px',
              textAlign: 'center',
              color: '#666'
            }}
          >
            {this.state.sendEmailTip}
          </div>
          <button
            onClick={this.sendEmail.bind(null, this.props.email)}
          >
            重新发送
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
    if(newPwd !== conPwd) {
      this.refs.refConfirmpwd.setTip('两次密码不一致');
      return;
    }

    currPwd && newPwd && conPwd && this.changePassword(currPwd, newPwd, conPwd);
  },
  changePassword: function(currPwd, newPwd, conPwd) {
    let _this = this;
    Ajax({  // 修改密码
      url: '/settings?type=USER_PASSWORD_SETTING',
      method: 'post',
      data: {
        csrf_token: Utils.getCookie('csrf_token'),
        old_password: Utils.encryptMd5(currPwd),
        password: Utils.encryptMd5(newPwd),
        confirm_password: Utils.encryptMd5(conPwd)
      },
      success: function (res) {
        if(res.success) {
          _this.refs.refConfirmpwd.setTip(':) 密码修改成功，请重新登录。1s后返回登录页', 'success');
          setTimeout(function() {
            window.location.reload();
          }, 2000);
        } else {
          _this.refs.refConfirmpwd.setTip(':( ' + res.message, 'tip');
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
          inputType="password"
        />
        <Validate
          placeholder='新密码'
          ref="refNewpwd"
          validate={rules.password}
          inputType="password"
          tip={{
            status: 'success',
            text: '6-16 位，大小写字母、数字及 \"\_\" 、 \"\.\" 的组合'
          }}
        />
        <Validate
          placeholder='新密码'
          ref="refConfirmpwd"
          validate={rules.password}
          inputType="password"
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
