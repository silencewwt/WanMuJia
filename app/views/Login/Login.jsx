'use strict';

require('../../assets/pages/login.html');
require('./Login.scss');

require('../../assets/images/favicon.png');

let utils = require('../../lib/utils/utils');

let React = require('react');
let ReactDOM = require('react-dom');

let LoginIn = require('../../lib/components/LoginIn/LoginIn.jsx');

var LoginWrap = React.createClass({
  render: function() {
    return (
      <div className="login-wrap">
        <LoginIn nextUrl="/" />
      </div>
    );
  }
});

ReactDOM.render(
  <LoginWrap />,
  document.getElementById("box")
);
