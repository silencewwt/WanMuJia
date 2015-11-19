'use strict';

require('./TopBar.scss');

let React = require('react');

//  ==================================================
//  Component: TopBar
//
//  Props: userInfo => object|null 登录状态
//
//  Include:
//
//  Use: Header
//
//  TODO:
//  ==================================================

let LoginedUserInfo = React.createClass({
  handleLogout: function(e) {
    e.preventDefault();

    console.log('logout');
  },
  render: function() {
    return (
      <div className="user-info">
        <span className="hello">你好，</span>
        <span className="profile">
          <a href="/profile">
            {this.props.userInfo.username}
          </a>
        </span>
        <span className="logout">
          <a
            href="/logout"
            onClick={this.handleLogout}
          >
            退出登录
          </a>
        </span>
      </div>
    );
  }
});

let UnloginedUserInfo = React.createClass({
  render: function() {
    return (
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
    );
  }
});

let UserInfo = React.createClass({
  render: function() {
    return (
      this.props.userInfo ?
      <LoginedUserInfo userInfo={this.props.userInfo} /> :
      <UnloginedUserInfo />
    );
  }
});

let SiteInfo = React.createClass({
  addToFav: function(e) {
    e.preventDefault();

    let url = 'http://www.wanmujia.com/';
    let title = '万木家 - 权威的红木家具导购平台';

    if(document.all) {
      window.external.addFavorite(url, title);
    } else if(window.sidebar) {
      window.sidebar.addPanel(url, title, '');
    } else {
      alert("请使用 Ctrl+D 将我们加入收藏");
    }
  },
  checkLoginStatus: function(e) {
    if(!this.props.userInfo) {
      console.log('未登录!!!!!');
      e.preventDefault();
    }
  },
  render: function() {
    return (
      <div className="site-info">
        <span className="fav">
          <a
            href="/profile?favorite"
            onClick={this.checkLoginStatus}
          >
            收藏夹
          </a>
        </span>
        <span className="my">
          <a
            href="/profile?my"
            onClick={this.checkLoginStatus}
          >
            我的万木家
          </a>
        </span>
        <span className="comp">
          <a href="/compare">商品对比</a>
        </span>
        <span className="crtl-d">
          <a href="#" onClick={this.addToFav}>收藏本站</a>
        </span>
        <span className="tel">
          服务电话：400 0117 440
        </span>
      </div>
    );
  }
});

let TopBar = React.createClass({
  getDefaultProps: function() {
    return {
      userInfo: null  // 登录状态
    };
  },
  render: function() {
    return (
      <div className="top-bar">
        <div className="container">
          <UserInfo userInfo={this.props.userInfo} />
          <SiteInfo userInfo={this.props.userInfo} />
        </div>
      </div>
    );
  }
});

module.exports = TopBar;
