'use strict';

require('./SignedupHeader.scss');
let React = require('react');

var SignedupHeader = React.createClass({
  render: function() {
    return (
      <div className="header">
        <div className="logo-box">
          <a href="#" className="">
            <img src="sd" alt="" />
          </a>
        </div>
        <p className="notice">
            dsds
        </p>
      </div>
    );
  }
});

module.exports = SignedupHeader;
