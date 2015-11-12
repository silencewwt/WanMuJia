'use strict';

require('./TopBar.scss');

let React = require('react');

//  ==================================================
//  Component: TopBar
//
//  Props:
//
//  Include:
//
//  Use: Header
//
//  TODO:
//  ==================================================

var TopBar = React.createClass({
  render: function() {
    return (
      <div className="top-bar">
        <div className="container">
          <div className="user-info">
            <span className="hello">欢迎来到万木家，</span>
            <span className="login">
              <a href="/login">请登录</a>
            </span>
            <span className="reg">
              免费
              <a className="reg-btn" href="/reg">注册</a>
            </span>
          </div>
          <div className="site-info">
            <span className="fav">
              <a href="/fav">收藏夹</a>
            </span>
            <span className="my">
              <a href="/my">我的万木家</a>
            </span>
            <span className="comp">
              <a href="/com">商品对比</a>
            </span>
            <span className="crtl-d">
              <a href="/star">收藏本站</a>
            </span>
            <span className="tel">
              服务电话：400 0117 440
            </span>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TopBar;
