'use strict';

require('../../assets/pages/reset_password.html');
require('./ResetPassword.scss');
require('../../assets/images/favicon.png');

let React = require('react');
let ReactDOM = require('react-dom');
let utils = require('../../lib/utils/utils');

let SignedUpHeader = require('./views/SignedUpHeader/SignedUpHeader.jsx');
let SignedUpBox = require('./views/SignedUpBox/SignedUpBox.jsx');

var ResetPassword = React.createClass({
  render: function() {
    return (
      <div className="wrap">
        <SignedUpHeader />
        <SignedUpBox />
      </div>
    );
  }
});

ReactDOM.render(
  <ResetPassword />,
  document.getElementById("box")
);
