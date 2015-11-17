'use strict';

let React = require('react');
let Logo = require('../../../../assets/images/logo.png');
let Qrcode = require('../../../../assets/images/qrcode.png');

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

var Banner = React.createClass({
  handleChangeCity: function(o) {
    console.log(o);
  },
  render: function() {
    return (
      <div className="banner">
        <div className="container">
          <div className="logo">
            <img src={Logo} title="万木家" />
          </div>
          <div className="city">
            <CityPickerWithTab callback={this.handleChangeCity} />
          </div>
          <div className="search">
            <div className="am-input-group">
              <input type="text" className="am-form-field" placeholder="搜索您喜欢的红木产品" />
              <span className="am-input-group-btn">
                <button className="am-btn am-btn-default" type="button">搜索</button>
              </span>
            </div>
          </div>
          <div className="qrcode">
            <img src={Qrcode} title="扫一扫关注我们" />
            <div>万木家官方微信平台</div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = Banner;
