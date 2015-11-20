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
      active: null
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
  render: function() {
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
                <SecMainBd item={item} /> :
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
    let inputWithBtnStyle = {
      input: {

      }
    };
    let usernameBd = (  // 修改会员名 折叠面板内容
      <form>
        <Validate
          placeholder='请输入你的手机号'
          ref="usPhone"
        />
        <Validate
          placeholder='请输入短信验证码'
          ref="usVerify"
          theme="verify"
        >
          <button type="button" className="">
            获取短信验证码
          </button>
        </Validate>
        <Validate
          placeholder='请输入新会员名'
          ref="usName"
        />
        <button type="button" className="username-sbt">
          修改
        </button>
      </form>
    );
    let emailBd = (  // 修改邮箱 折叠面板内容
      <form>
        <Validate
          placeholder='请输入你的手机号'
          ref="usPhone"
        />
        <Validate
          placeholder='请输入短信验证码'
          ref="usVerify"
          theme="verify"
        >
          <button type="button" className="">
            获取短信验证码
          </button>
        </Validate>
        <Validate
          placeholder='请输入邮箱地址'
          ref="usVerify"
        />
        <button type="button" className="email-sbt">
          发送验证邮件
        </button>
      </form>
    );
    let passwordBd = (   // 修改密码 折叠面板内容
      <form>
        <Validate
          placeholder='当前密码'
          ref="usPwd"
        />
        <Validate
          placeholder='新密码'
          ref="usNewpwd"
        />
        <Validate
          placeholder='新密码'
          ref="usConfirmpwd"
        />
        <button type="button" className="username-sbt">
          确认修改
        </button>
      </form>
    );
    let bdInstance;
    switch (this.props.item.type) {
      case 'username':
        bdInstance = usernameBd;
        break;
      case 'email':
        bdInstance = emailBd;
        break;
      case 'password':
        bdInstance = passwordBd;
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

module.exports = Security;
