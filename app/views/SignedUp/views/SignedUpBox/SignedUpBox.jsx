'use strict';

require('./SignedupBox.scss');
let React = require('react');

var utils = require("../../../../lib/utils/utils.js");
var reg = utils.getRegs();
var queryStringToJson = utils.queryStringToJson;

var SignedupBox = React.createClass({
  getInitialState: function() {
    return {
      step: 1,
    };
  },
  toNext: function() {
    this.setState({step: ++this.state.step});
  },
  componentWillMount: function() {
    let step = queryStringToJson(window.location.search.substring(1,window.location.search.length)).step;
    if(!step) {
      return ;
    }
    this.setState({step: step});
  },
  render: function() {
    return (
      <div className="su-box">
        <SuStep step={this.state.step} />
        <SuMain step={this.state.step} toNext={this.toNext} />
      </div>
    );
  }
});

var SuStep = React.createClass({
  render: function() {
    return (
      <ul className="su-step">
        <li className={this.props.step==1?"active":null}>
          <span className="step-num">1</span>
          <span>填写手机号</span>
        </li>
        <li className={this.props.step==2?"active":null}>
          <span className="step-num">2</span>
          <span>设置账户信息</span></li>
        <li className={this.props.step==3?"active":null}>
          <span className="step-num">3</span>
          <span>注册成功</span>
        </li>
      </ul>
    );
  }
});

var SuMain = React.createClass({
  render: function() {
    var suStep = "";
    switch (this.props.step.toString()) {
      case "1": suStep = (<SuStep1 toNext={this.props.toNext} />);
        break;
      case "2": suStep = (<SuStep2 toNext={this.props.toNext} />);
        break;
      case "3": suStep = (<SuStep3 />);
        break;
      default: suStep = (<SuStep1 toNext={this.props.toNext} />);
    }
    return (
      <div className="su-main">
        {suStep}
      </div>
    );
  }
});

var SuStep1 = React.createClass({
  getInitialState: function() {
    return {
      mp: "",
      mpErrTip: "",
      captcha: "",
      captchaErrTip: "",
      agree: true,
    };
  },
  setMp: function(value) {
    this.setState({mp: value});
  },
  checkMp: function() {
    var mp = this.state.mp;
    if(mp.length === 0) {
      this.setState({mpErrTip: "请输入手机号码"});
      return false;
    }
    var patrn = reg.mobile;
    if (!patrn.exec(mp)) {
      this.setState({mpErrTip: "请输入正确的手机号码"});
      return false;
    }
    return true;
  },
  setCaptcha: function(value) {
    this.setState({captcha: value});
  },
  checkCaptcha: function() {
    var captcha = this.state.captcha;
    if(captcha.length === 0) {
      this.setState({captchaErrTip: "请输入验证码"});
      return false;
    }
    var patrn = reg.captcha;
    if (!patrn.exec(captcha)) {
      this.setState({captchaErrTip: "请输入正确的验证码"});
      return false;
    }
    return true;
  },
  getCaptcha: function() {
    var mp = this.state.mp;
    if(this.state.mpErrTip) {
      return false;
    }
    // TODO: ajax
    this.setState({mpErrTip: "手机号码已经被注册"});
  },
  setAgree: function() {
    this.setState({agree: !this.state.agree});
  },
  // 'mp'/'captcha'   0/1 0 clear value and errtip 1 clear errtip
  clear: function(ipt, num) {
    switch (ipt) {
      case "mp": if(num) { this.setState({mpErrTip: ""});return ; }
         this.setState({mpErrTip: "", mp: ""});
        break;
      case "captcha": if(num) { this.setState({captchaErrTip: ""});return ; }
         this.setState({captchaErrTip: "", captcha: ""});
        break;
      default: return ;
    }
  },
  doNext: function() {
    if(this.state.mp.toString().length === 0) {
      this.setState({mpErrTip: "请输入手机号码"});
      return false;
    }else if(this.state.captcha.toString().length === 0) {
      this.setState({captchaErrTip: "请输入验证码"});
      return false;
    }else if(!this.state.agree) {
      return false;
    }else if(this.state.mpErrTip||this.state.captchaErrTip) {
      return false;
    }
    alert('ok');
    // TODO: ajax请求，返回结果，错误，提示，正确，改变状态到下一步
    this.props.toNext();
  },
  render: function() {
    return (
      <form>

        <MpInputGroup
          setValue={this.setMp}
          clear={this.clear}
          check={this.checkMp}
          value={this.state.mp}
          errTip={this.state.mpErrTip} />

        <CaptchaInputGroup
          setValue={this.setCaptcha}
          getCaptcha={this.getCaptcha}
          clear={this.clear}
          check={this.checkCaptcha}
          errTip={this.state.captchaErrTip}
          value={this.state.captcha} />

        <AgreeInputGroup
          setValue={this.setAgree}
          agree={this.state.agree} />

        <NextButton
          next={this.doNext}>
          同意协议且注册
        </NextButton>

      </form>
    );
  }
});

var MpInputGroup = React.createClass({
  handleChange: function(e) {
    var value= e.target.value.substring(0,11);
    this.props.setValue(value);
  },
  render: function() {
    var errTip = this.props.errTip;
    return (
      <div className={(errTip.length?"err ":"") + "input-group"}>

        <input
          value={this.props.value}
          onChange={this.handleChange}
          onFocus={this.props.clear.bind(null, "mp", 1)}
          onBlur={this.props.check}
          type="text"
          className="mp ipt"
          placeholder="请输入你的手机号"
          autoFocus={true}/>

        <span onClick={this.props.clear.bind(null, "mp", 0)} className="del-icon">+</span>

        <div className="tip err" >{errTip}</div>

      </div>
    );
  }
});

var CaptchaInputGroup = React.createClass({
  handleChange: function(e) {
    var value= e.target.value.substring(0,6);
    this.props.setValue(value);
  },
  render: function() {
    var errTip = this.props.errTip;
    return (
      <div className={(errTip.length?"err ":"") + "input-group"}>

        <input
          value={this.props.value}
          onChange={this.handleChange}
          onFocus={this.props.clear.bind(null, "captcha",1)}
          onBlur={this.props.check}
          type="text"
          className="captcha ipt"
          placeholder="请输入短信验证码" />

        <input
          onClick={this.props.getCaptcha}
          type="button"
          className="send-captcha able"
          value="获取短信验证码" />

        <span onClick={this.props.clear.bind(null, "captcha",0)} className="del-icon captcha">+</span>
        <div className="tip err" >{errTip}</div>

      </div>
    );
  }
});

var AgreeInputGroup = React.createClass({
  render: function() {
    return (
      <div className={(this.props.agree?"":"err ")+"input-group agree"}>

        <input type="checkbox" className="agree" name="agree" id="agree" />

        <label onClick={this.props.setValue} className={(this.props.agree?"checked ":"")+"check"} htmlFor="agree"></label>

        <label className="instruct" htmlFor="agree">
          注册表示你同意万木家
          <a href="#">《用户使用条款》</a>
        </label>

        <div className="tip err" >你必须同意万木家服务条款后，才能提交注册</div>

      </div>
    );
  }
});

var NextButton = React.createClass({
  render: function() {
    return (
      <div className="input-group">

        <input onClick={this.props.next} type="button" value={this.props.children} className="next" />

        <div className="tip err" ></div>

      </div>
    );
  }
});

var SuStep2 = React.createClass({
  getInitialState: function() {
    return {
      psw: "",
      pswErrTip: "",
      pswagain: "",
      pswagainErrTip: ""
    };
  },
  setPsw: function(value) {
    this.setState({psw: value});
  },
  checkPsw: function() {
    var psw = this.state.psw;
    if(psw.length === 0) {
      this.setState({pswErrTip: "请输入密码"});
      return false;
    }
    var patrn = reg.userPassword;
    if (!patrn.exec(psw)) {
      this.setState({pswErrTip: "请输入正确格式的密码"});
      return false;
    }
    return true;
  },
  setPswagain: function(value) {
    this.setState({pswagain: value});
    var pswagain = value;
    if(pswagain.length === 0) {return false;}
    if(pswagain.length > this.state.psw.length||
      pswagain != this.state.psw.substr(0,pswagain.length)) {
      this.setState({pswagainErrTip: "两次输入密码不一致"});
      return false;
    }
    this.setState({pswagainErrTip: ""});
    return true;
  },
  checkPswagain: function() {

  },
  // 'psw'/'pswagain'   0/1 0 clear value and errtip 1 clear errtip
  clear: function(ipt, num) {
    switch (ipt) {
      case "psw": if(num) { this.setState({pswErrTip: ""});return ; }
         this.setState({pswErrTip: "", psw: ""});
        break;
      case "pswagain": if(num) { this.setState({pswagainErrTip: ""});return ; }
         this.setState({pswagainErrTip: "", pswagain: ""});
        break;
      default: return ;
    }
  },
  doNext: function() {
    if(this.state.psw.toString().length === 0) {
      this.setState({mpErrTip: "请输入密码"});
      return false;
    }else if(this.state.pswagain.toString().length === 0) {
      this.setState({pswagainErrTip: "请再次输入密码"});
      return false;
    }else if(this.state.pswErrTip||this.state.pswagainErrTip) {
      return false;
    }
    alert('ok');
    // TODO: ajax请求，返回结果，错误，提示，正确，改变状态到下一步
    this.props.toNext();
  },
  render: function() {
    return (
      <form>

        <PswInputGroup
          setValue={this.setPsw}
          clear={this.clear}
          check={this.checkPsw}
          value={this.state.psw}
          errTip={this.state.pswErrTip} />

        <PswCheckInputGroup
          setValue={this.setPswagain}
          clear={this.clear}
          check={this.checkPswagain}
          value={this.state.pswagain}
          errTip={this.state.pswagainErrTip} />

        <NextButton next={this.doNext}>完成</NextButton>

      </form>
    );
  }
});

var PswInputGroup = React.createClass({
  handleChange: function(e) {
    var value= e.target.value;
    this.props.setValue(value);
  },
  render: function() {
    var errTip = this.props.errTip;
    return (
      <div className={(errTip.length?"err ":"") + "input-group"}>

        <input
          value={this.props.value}
          onChange={this.handleChange}
          onFocus={this.props.clear.bind(null, "psw", 1)}
          onBlur={this.props.check}
          type="password"
          className="ipt"
          autoFocus={true}
          placeholder="请设置账号密码" />

        <div className="ipt-tip">
          密码为6-16位字符，支持字母、数字与“.”及“_”的组合
        </div>

        <span onClick={this.props.clear.bind(null, "psw", 0)} className="del-icon">+</span>
        <div className="tip err" >{errTip}</div>

      </div>
    );
  }
});

var PswCheckInputGroup = React.createClass({
  handleChange: function(e) {
    var value= e.target.value;
    this.props.setValue(value);
  },
  render: function() {
    var errTip = this.props.errTip;
    return (
      <div className={(errTip.length?"err ":"") + "input-group"}>

        <input
          value={this.props.value}
          onChange={this.handleChange}
          onFocus={this.props.clear.bind(null, "pswagain", 1)}
          onBlur={this.props.check}
          type="password"
          className="ipt"
          placeholder="请再次输入密码" />

        <span onClick={this.props.clear.bind(null, "pswagain", 0)} className="del-icon">+</span>
        <div className="tip err" >{errTip}</div>

      </div>
    );
  }
});

var SuStep3 = React.createClass({
  getInitialState: function() {
    return {
      second: 3,
    };
  },
  componentDidMount: function() {
    setInterval(function() {
      this.setState({second: --this.state.second}, function() {
        if(this.state.second === 0) {
          //window.location.href = "/";
        }
      });
    }.bind(this) , 1000);
  },
  render: function() {
    return (
      <div className="result-box">

        <div className="result-title">
          恭喜你注册成功
        </div>

        <p className="result-detail">
          你的登录账号是：<span className="d">18710899072</span>
          会员名是：<span className="d">123456789</span>
        </p>

        <p className="result-detail">
          此账号是你尊贵身份的象征，请务必牢记
        </p>

        <div className="return">
          <div className="r">
            系统将在{this.state.second}秒后自动跳转
          </div>

          <a href="#">立即跳转</a>
        </div>

      </div>
    );
  }
});

module.exports = SignedupBox;
