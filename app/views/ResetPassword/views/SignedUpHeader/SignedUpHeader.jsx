'use strict';

require('./SignedUpHeader.scss');
let React = require('react');

var SignedUpHeader = React.createClass({
  render: function() {
    return (
      <div className="header">

        <div className="logo-box">
          <a href="/">
            <div className="logo"></div>
          </a>

          <div className="title">找回密码</div>
        </div>

        <p className="notice">
            马上<a href="/login">{"登录>"}</a>
        </p>
      </div>
    );
  }
});

module.exports = SignedUpHeader;
