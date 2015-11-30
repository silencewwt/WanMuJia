// TODO: 验证码图片的获取和点击变化，发送地址ajax以及发送成功提示
'use strict';

require('./InfoSelectShop.scss');
let React = require('react');
let reqwest = require('reqwest');
let ReactDOM = require('react-dom');
let utils = require('../../../../../../../../lib/utils/utils.js');
let getCookie = utils.getCookie;

const STR = ["0","1","2","3","4","5","6","7","8","9","A",
"B","C","D","E","F","G","H","I","J","K","L","M","N","O",
"P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c",
"d","e","f","g","h","i","j","k","l","m","n","o","p","q","r",
"s","t","u","v","w","x","y","z"];

var InfoSelectShop = React.createClass({
  getInitialState: function() {
    return {
      shopId: null,
      extNum: null,
    };
  },
  selectShop: function(id, extNum) {
    this.setState({shopId: id});
    if(extNum) {
      this.setState({extNum: extNum});
    } else {
      this.setState({extNum: null});
    }
  },
  showSendBox: function() {
    this.refs.sendBox.show();
  },
  render: function() {
    return (
      <div className="info-select">
        <div className="phone">电话咨询：{this.state.shopId?("400-863-7896 转 "+this.state.extNum||""):"请先选择体验馆"}</div>

        <SelectShop
          shopId={this.state.shopId}
          showSendBox={this.showSendBox}
          data={this.props.data}
          selectShop={this.selectShop}
        />

      <SendBox
        ref="sendBox"
        mobile={this.props.mobile}
        shopId={this.state.shopId}
      />

      <div className="shop-img"><img src={require('../../../../../../../../assets/images/shop.png')} /></div>
      </div>
    );
  }
});

var SelectShop = React.createClass({
  render: function() {
    return (
      <div className="select-shop">

        <SelectBox
          data={this.props.data}
          selectShop={this.props.selectShop}
        />

        <SendButton
          shopId={this.props.shopId}
          showSendBox={this.props.showSendBox}
        />

      </div>
    );
  }
});

var SelectBox = React.createClass({
  getInitialState: function() {
    return {
      provinceId: null,
      cityId: null,
      shopId: null,
    };
  },
  selectProvince: function(id) {
    if(id == this.state.provinceId) return ;
    this.setState({provinceId: id, cityId: null, shopId: null});
    this.props.selectShop(null,null);
  },
  selectCity: function(id) {
    if(id == this.state.cityId) return ;
    this.setState({cityId: id, shopId: null});
    this.props.selectShop(null,null);
  },
  selectShop: function(id, extNum) {
    this.props.selectShop(id,extNum);
    if(id == this.state.shopId) return ;
    this.setState({shopId: id});
  },
  render: function() {
    // 处理商店的 json 数据
    var shopData = null;
    if(this.state.cityId) {
      shopData = {};
      let data = this.props.data[this.state.provinceId].children[this.state.cityId].children;
      for(let key1 in data) {
        for(let key2 in data[key1].distributors) {
          shopData[key2] = {
            area: data[key1].distributors[key2].name,
            extNum: data[key1].distributors[key2].ext_number,
          };
        }
      }
    }
    return (
      <div className="select-box">
        <div className="address-box">
          <div className="label">所在地：</div>
          <Dropdown
            data={this.props.data}
            liClick={this.selectProvince}
          />
          <Dropdown
            data={this.state.provinceId?this.props.data[this.state.provinceId].children:null}
            liClick={this.selectCity}
          />
        </div>
        <div className="shop-box">
          <div className="label">体验馆：</div>
          <Dropdown
            data={shopData}
            liClick={this.selectShop}
          />
        </div>
      </div>
    );
  }
});

var SendButton = React.createClass({
  getInitialState: function() {
    return {
      err: ""
    };
  },
  handleClick: function() {
    if(!this.props.shopId) {
      this.setState({err: "请先选择体验馆"}, function() {
        setTimeout(function() {
          this.setState({err: ""});
        }.bind(this) , 3000);
      });
      return ;
    }
    this.props.showSendBox();
  },
  render: function() {
    return (
      <div className="send-button">
        <button onClick={this.handleClick}>免费发送地址到手机</button>
        {this.state.err?<div className="tip">{this.state.err}</div>:null}
      </div>
    );
  }
});

var Dropdown = React.createClass({
  getInitialState: function() {
    return {
      active: false,
      area: "请选择地址",
    };
  },
  allClick: function(e) {
    if (ReactDOM.findDOMNode(this).contains(e.target)) {
      return ;
    }
    this.setState({active: false});
  },
  componentDidMount: function() {
    document.addEventListener('mousedown', this.allClick, false);
  },
  componentWillUnmount: function () {
    document.removeEventListener('mousedown', this.allClick, false);
  },
  handleClick: function() {
    if(!this.props.data) return ;
    this.setState({active: !this.state.active});
  },
  liClick: function(id,area,extNum) {
    this.setState({active: false});
    this.props.liClick(id, extNum);
    setTimeout(function() {
      this.setState({area: area});
    }.bind(this) , 50);
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    if(nextProps.data != this.props.data) {
      this.setState({area: "请选择地址"});
    }
    return nextProps.data == this.props.data;
  },
  render: function() {
    let liNodes = [];
    if(this.props.data) {
      let i = 0;
      for(let key in this.props.data) {
        liNodes[i] =
        <li
          key={key}
          onClick={this.liClick.bind(null,key,this.props.data[key].area, this.props.data[key].extNum||"")}>
          {this.props.data[key].area}
        </li>;
        i++;
      }
    }
    return (
      <div onClick={this.allClick} className={(this.state.active?"active ":"") + "dropdown"}>
        <button onClick={this.handleClick}>{this.state.area}</button>
        <ul>
          {liNodes}
        </ul>
      </div>
    );
  }
});

var SendBox = React.createClass({
  getInitialState: function() {
    return {
      show: false,
      isCaptcha: true,
      mobile: "",
      captcha: "",
      mobileTip: "",
      captchaTip: "",
      allTip: "",
      captchaSrc: "",
    };
  },
  allClick: function(e) {
    if (ReactDOM.findDOMNode(this).contains(e.target)) {
      return ;
    }
    this.setState({show: false});
  },
  componentDidMount: function() {
    document.addEventListener('mousedown', this.allClick, false);
    this.createCaptcha();
  },
  componentWillUnmount: function () {
    document.removeEventListener('mousedown', this.allClick, false);
  },
  show: function() {
    this.setState({show: true});
  },
  hide: function() {
    this.setState({show: false});
  },
  //
  shouldComponentUpdate: function(nextProps, nextState) {
    if(nextProps.mobile != this.props.mobile) {
      this.setState({mobile: nextProps.mobile});
      this.setState({isCaptcha: false});
    }
    return nextProps.mobile == this.props.mobile;
  },
  mobileChange: function(e) {
    this.setState({mobile: e.target.value});
    if(e.target.value != this.props.mobile) {
      this.setState({isCaptcha: true});
    } else {
      this.setState({isCaptcha: false});
    }
  },
  mobileClearErr: function() {
    this.setState({mobileTip: ""});
  },
  mobileCheck: function(e) {
    var mobile = e.target.value;
    if(mobile.length === 0) {
      this.setState({mobileTip: "请输入手机号码"});
      return false;
    }
    var patrn = /^((1[3-8][0-9])+\d{8})$/;
    if (!patrn.exec(mobile)) {
      this.setState({mobileTip: "请输入正确的手机号码"});
      return false;
    }
    return true;
  },
  captchaChange: function(e) {
    this.setState({captcha: e.target.value});
  },
  captchaClearErr: function() {
    this.setState({captchaTip: ""});
  },
  captchaCheck: function(e) {
    var captcha = e.target.value;
    if(captcha.length === 0) {
      this.setState({captchaTip: "请输入验证码"});
      return false;
    }
  },
  createCaptcha: function() {
    var result="";
    for(var i=0;i<32;i++){
        var r = Math.floor(Math.random()*62);
        result+=STR[r];
    }
    var captchaSrc = '/service/captcha/' + result + '.jpg';
    this.setState({captchaSrc: captchaSrc});
  },
  send: function() {
    if(this.state.mobile.length===0||this.state.mobileTip||this.state.captcha.length===0||this.state.captchaTip) return ;
//    if(this.state.isCaptcha) {
//      if(this.state.captcha.length===0||this.state.captchaTip) return ;
//    }
    var csrfToken = utils.getCookie('csrf_token');
    reqwest({
      url: '/service/mobile_sms?type=USER_GUIDE',
      method: 'post',
      data: {
        mobile: this.state.mobile,
        captcha: this.state.captcha,
        distributor_id: this.props.shopId,
        csrf_token: csrfToken
      },
      success: function(resp) {
        if(resp.success) {
          this.setState({allTip: "发送地址成功，请查收"});
          setTimeout(function() {
            this.setState({allTip: ""});
            this.hide();
          }.bind(this) , 2800);
        } else {
          this.createCaptcha();
          this.setState({allTip: resp.message});
          setTimeout(function() {
            this.setState({allTip: ""});
          }.bind(this) , 2000);
        }
        setTimeout(function() {
//          this.hide();
          this.setState({allTip: ""});
        }.bind(this) , 2800);
      }.bind(this),
    });
  },
  render: function() {
    return (
      <div
        className={(this.state.show?"show ":"") + "send-box"}
        onClick={this.allClick} >

        <div className="ipt-group">
          <label>手机号：</label>
          <input
            value={this.state.mobile}
            onChange={this.mobileChange}
            onFocus={this.mobileClearErr}
            onBlur={this.mobileCheck}
            className="mobile"
            type="text"
          />
          <div className="tip">{this.state.mobileTip}</div>
        </div>

        <div className="ipt-group">
          <label>验证码：</label>
          <input
            value={this.state.captcha}
            onChange={this.captchaChange}
            onFocus={this.captchaClearErr}
            onBlur={this.captchaCheck}
            className="captcha"
            type="text"
          />
        <div className="cap-img" onClick={this.createCaptcha}>
            <img src={this.state.captchaSrc } />
          </div>
          <div className="tip">{this.state.captchaTip}</div>
        </div>

        <div className="ipt-group">
          <label></label>
          <button
            className="send-button"
            onClick={this.send}>
            免费发送地址到手机
          </button>
          <div className="tip">{this.state.allTip}</div>
        </div>

      </div>
    );
  }
});

module.exports = InfoSelectShop;
