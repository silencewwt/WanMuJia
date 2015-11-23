'use strict';

require('./FloatBottomTip.scss');

let React = require('react');
let BackTop = require('./BackTop/BackTop.jsx');

var FloatBottomTip = React.createClass({
  render: function() {
    return (
      <div className="float-bottom-tip">
        <div>对比</div>
        <BackTop />
      </div>
    );
  },
});

module.exports = FloatBottomTip;
