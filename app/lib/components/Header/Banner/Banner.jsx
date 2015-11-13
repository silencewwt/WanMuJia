'use strict';

let React = require('react');

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

var Banner = React.createClass({
  render: function() {
    return (
      <div className="banner">
        <div className="container">
          <div className="logo">
            <img src="logo.png" title="万木家" />
          </div>
          <div className="city">
            选城市
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
            <img src="qrcode.png" title="扫一扫关注我们" />
            <div>万木家官方微信平台</div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = Banner;
