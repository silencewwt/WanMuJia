'use strict';

require('./SignedupHeader.scss');
let React = require('react');

var SignedupHeader = React.createClass({
  render: function() {
    return (
      <div className="header">

        <div className="logo-box">
          <a href="/">
            <div className="logo"></div>
          </a>

          <div className="title">欢迎注册</div>
        </div>

        <p className="notice">
            我已注册，马上<a href="/login">{"登录>"}</a>
        </p>
      </div>
    );
  }
});

module.exports = SignedupHeader;
