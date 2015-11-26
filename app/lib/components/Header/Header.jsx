'use strict';

require('./Header.scss')

let React= require('react');

//  ==================================================
//  Component: Header
//
//  Props: userInfo => object|null 登录状态
//         shrink => boolean 主导航是否折叠
//         defaultValue => string 搜索框的默认值
//
//  Dependence: liib::TopBar lib::Banner lib::HeaderNav lib::MainNav
//
//  TODO:
//  ==================================================

let TopBar = require('../TopBar/TopBar.jsx');
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
        <Banner defaultSearchValue={this.props.defaultSearchValue} />
        <div className="container">
          <MainNav shrink={this.props.shrink} />
          <HeaderNav />
        </div>
        {this.props.children}
      </div>
    );
  }
});

module.exports = Header;
