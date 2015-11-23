'use strict';

require('./FloatBottomTip.scss');

let React = require('react');
let BackTop = require('./BackTop/BackTop.jsx');
let CompareBar = require('../CompareBar/CompareBar.jsx');

var FloatBottomTip = React.createClass({
  render: function() {
    return (
      <div className="float-bottom-tip">
        <CompareBar />
        <BackTop />
      </div>
    );
  },
});

module.exports = FloatBottomTip;
