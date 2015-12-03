'use strict';

require("./LoginIn.scss");

let React = require("react");

let reqwest = require("reqwest");
let utils = require("../../utils/utils");
let encryptMd5 = utils.encryptMd5;
let getCookie = utils.getCookie;

// props: callback  nextUrl

var LoginIn = React.createClass({
  getInitialState: function() {
    return {
      user: "",
      userErrTip: "",
      psw: "",
      pswErrTip: "",
      nextErrTip: "",
      remd: true,
      nextAction: true,
    };
  },
  setUser: function(value) {
    this.setState({user: value});
  },
  setPsw: function(value) {
    this.setState({psw: value});
  },
  setRemd: function() {
    this.setState({remd: !this.state.remd});
  },
  clear: function(type, num) {
    switch (type) {
      case "user": this.setState({userErrTip: "", nextErrTip: ""});
        if(!num) {this.setState({user: ""});}
        break;
      case "psw": this.setState({pswErrTip: "", nextErrTip: ""});
        if(!num) {this.setState({psw: ""});}
        break;
      default: return;
    }
  },
  doNext: function() {
    if(!this.state.user) {
      this.setState({userErrTip: "请输入 邮箱/手机号/用户名"});
      return false;
    }else if(!this.state.psw) {
      this.setState({pswErrTip: "请输入密码"});
      return false;
    }else if(this.state.userErrTip||this.state.pswErrTip) {
      return false;
    }
    // TODO: ajax请求登录，如果失败，根据后端返回信息设置错误信息。
    //        如果正确，根据是否有 URL 属性决定跳转还是回调
    this.setState({nextAction: false});
    reqwest({
      url: '/login',
      method: 'post',
      data: {
        username: this.state.user,
        password: encryptMd5(this.state.psw),
        remember: this.state.remd,
        csrf_token: getCookie("csrf_token"),
      },
      success: function(resp) {
        if(resp.success) {
          this.setState({nextErrTip: "登录成功"});
           if(this.props.nextUrl) {
             window.location.href = this.props.nextUrl;
             return ;
           }
           window.location.reload();
           //this.props.callback(resp);
           return ;
        }
        this.setState({nextErrTip: resp.message});
        this.setState({nextAction: true});
      }.bind(this),
      error: function(err) {
        this.setState({nextErrTip: "服务器出错"});
        this.setState({nextAction: true});
      }.bind(this),
    });
  },
  handleKeyUp: function(e) {
    if(e.key == "Enter") {
      this.doNext();
    }
  },
  render: function() {
    return (
      <div className="login-box" onKeyUp={this.handleKeyUp}>

        <div className="header-logo">
          <div className="logo"></div>
        </div>

        <UserInputGroup
          setValue={this.setUser}
          value={this.state.user}
          errTip={this.state.userErrTip}
          clear={this.clear} />

        <PseInputGroup
          setValue={this.setPsw}
          value={this.state.psw}
          errTip={this.state.pswErrTip}
          clear={this.clear} />

        <RemdLoginGroup
          setValue={this.setRemd}
          remd={this.state.remd} />

        <NextButton
          next={this.doNext}
          nextAction={this.state.nextAction}
          errTip={this.state.nextErrTip} />

      </div>
    );
  }
});

var UserInputGroup = React.createClass({
  handleChange: function(e) {
    this.props.setValue(e.target.value);
  },
  render: function() {
    let errTip = this.props.errTip;
    return (
      <div className={(errTip.length?"err ":"") + "input-group"}>

        <input
          onChange={this.handleChange}
          onFocus={this.props.clear.bind(null,"user",1)}
          value={this.props.value}
          autoFocus={true}
          type="text"
          className="ipt"
          placeholder="邮箱/手机号/用户名" />

        <span onClick={this.props.clear.bind(null,"user",0)} className="del-icon">+</span>
        <div className="tip err" >{errTip}</div>

      </div>
    );
  }
});

var PseInputGroup = React.createClass({
  handleChange: function(e) {
    this.props.setValue(e.target.value);
  },
  render: function() {
    let errTip = this.props.errTip;
    return (
      <div className={(errTip.length?"err ":"") + "input-group"}>

        <input
          onChange={this.handleChange}
          onFocus={this.props.clear.bind(null,"psw",1)}
          value={this.props.value}
          type="password"
          className="ipt"
          placeholder="密码" />

        <span onClick={this.props.clear.bind(null,"psw",0)} className="del-icon">+</span>
        <div className="tip err" >{errTip}</div>

      </div>
    );
  }
});

var RemdLoginGroup = React.createClass({
  render: function() {
    return (
      <div className={"input-group remd"}>

        <input type="checkbox" className="remd" name="remd" id="remd" />

        <label onClick={this.props.setValue} className={(this.props.remd?"checked ":"")+"check"} htmlFor="remd"></label>

        <label className="instruct" htmlFor="remd">
          自动登录
        </label>

        <div className="a-group">
          <a href="/reset_password">忘记密码</a>
          |
          <a href="/register">免费注册</a>
        </div>

        <div className="tip err" ></div>

      </div>
    );
  }
});

var NextButton = React.createClass({
  render: function() {
    let errTip = this.props.errTip;
    return (
      <div className={(errTip.length?"err ":"") + "input-group"}>

        <input disabled={!this.props.nextAction} onClick={this.props.next} type="button" value="完成" className="next" />
        <div className="tip err" >{errTip}</div>

      </div>
    );
  }
});

module.exports = LoginIn;
