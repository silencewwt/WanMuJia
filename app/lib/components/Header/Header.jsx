'use strict';

require('./Header.scss')

let React= require('react');

//  ==================================================
//  Component: Header
//
//  Props: userInfo => object|null 登录状态
//         shrink => boolean 主导航是否折叠
//
//  Dependence:
//
//  TODO:
//  ==================================================

let TopBar = require('./TopBar/TopBar.jsx');
let Banner = require('./Banner/Banner.jsx');
let HeaderNav = require('./HeaderNav/HeaderNav.jsx');
let MainNav = require('./MainNav/MainNav.jsx');

var Header = React.createClass({
  getDefaultProps: function() {
    return {
      userInfo: null, // 登录状态
      shrink: false // 主导航是否折叠
    };
  },
  render: function() {
    return (
      <div className="header">
        <TopBar userInfo={this.props.userInfo} />
        <Banner />
        <div className="container">
          <MainNav
            items={this.props.mainNav}
            shrink={this.props.shrink}
          />
          <HeaderNav />
        </div>
        {this.props.children}
      </div>
    );
  }
});

module.exports = Header;
