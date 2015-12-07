'use strict';

require('../../assets/pages/signed_up.html');
require('./SignedUp.scss');
require('../../assets/images/favicon.png');

let React = require('react');
let ReactDOM = require('react-dom');
let utils = require('../../lib/utils/utils');

let SignedUpHeader = require('./views/SignedUpHeader/SignedUpHeader.jsx');
let SignedUpBox = require('./views/SignedUpBox/SignedUpBox.jsx');

var SignedUp = React.createClass({
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
  <SignedUp />,
  document.getElementById("box")
);
