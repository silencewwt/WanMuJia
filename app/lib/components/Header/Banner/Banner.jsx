'use strict';

let React = require('react');
let LogoImg = require('../../../../assets/images/logo.png');
let QrcodeImg = require('../../../../assets/images/qrcode.jpg');

//  ==================================================
//  Component: Banner
//
//  Props:
//
//  Include:
//
//  Use:  Header
//
//  TODO:
//  ==================================================

let CityPickerWithTab = require('./CityPickerWithTab/CityPickerWithTab');

let Logo = React.createClass({
  render: function() {
    return (
      <div className="logo" title="进入万木家首页">
        <a href="/">
          <img src={LogoImg} alt="万木家" />
        </a>
      </div>
    );
  }
});

let Search = React.createClass({
  getInitialState: function() {
    return {
      keyword: ''
    };
  },
  handleKeywordRt: function(e) {
    if(e.keyCode === 13) {
      this.handleSubmitClick();
    } else {
      this.setState({
        keyword: e.target.value
      });
    }
  },
  handleSubmitClick: function() {
    // if(!this.state.keyword) {
    //   return;
    // }
    let url = '/item/?search=' + this.state.keyword;
    location.href = url;
  },
  render: function() {
    return (
      <div className="search">
        <div className="am-input-group">
          <input
            type="text"
            className="am-form-field"
            placeholder="搜索你喜欢的红木产品"
            defaultValue={this.props.defaultValue}
            onBlur={this.handleSearchBlur}
            onKeyUp={this.handleKeywordRt}
          />
          <span
            className="am-input-group-btn"
            onClick={this.handleSubmitClick}
          >
            <button className="am-btn am-btn-default" type="button" title="搜索">
              搜索
            </button>
          </span>
        </div>
      </div>
    );
  }
});

let Qrcode = React.createClass({
  render: function() {
    return (
      <div className="qrcode">
        <img src={QrcodeImg} title="扫一扫关注我们" />
        <div>万木家官方微信平台</div>
      </div>
    );
  }
});

let Banner = React.createClass({
  handleChangeCity: function(o) {
    console.log(o);
  },
  render: function() {
    return (
      <div className="banner">
        <div className="container">
          <Logo />
          <CityPickerWithTab callback={this.handleChangeCity} />
          <Search defaultValue={this.props.defaultSearchValue}/>
          <Qrcode />
        </div>
      </div>
    );
  }
});

module.exports = Banner;
