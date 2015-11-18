'use strict';

let React = require('react');
let LogoImg = require('../../../../assets/images/logo.png');
let QrcodeImg = require('../../../../assets/images/qrcode.png');

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
      <div className="logo">
        <img src={LogoImg} title="万木家" />
      </div>
    );
  }
});

let Search = React.createClass({
  getInitialState: function() {
    return {
      keyword: null
    };
  },
  handleSubmitClick: function(e) {
    if(!this.state.keyword) {
      return;
    }

    let url = '/item/?search=' + this.state.keyword;
    location.href = url;
  },
  handleSearchBlur: function(e) {
    this.setState({
      keyword: e.target.value
    });
  },
  render: function() {
    return (
      <div className="search">
        <div className="am-input-group">
          <input
            type="text"
            className="am-form-field"
            placeholder="搜索您喜欢的红木产品"
            onBlur={this.handleSearchBlur}
          />
          <span
            className="am-input-group-btn"
            onClick={this.handleSubmitClick}
          >
            <button className="am-btn am-btn-default" type="button">
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
          <Search />
          <Qrcode />
        </div>
      </div>
    );
  }
});

module.exports = Banner;
