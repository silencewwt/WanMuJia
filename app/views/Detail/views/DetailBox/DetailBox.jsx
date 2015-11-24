'use strict';

require('./DetailBox.scss');

let React = require('react');
let utils = require('../../../../lib/utils/utils.js');

let reqwest = require('reqwest');

var DetailBox = React.createClass({
  render: function() {
    return (
      <div className="detail-box">DetailBox</div>
    );
  }
});

module.exports = DetailBox;
