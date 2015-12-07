'use strict';

/**
*
* compareBarAddItem(item)
*
*         item = { id: "", image_url: "", item: "", price: "", is_suite: boolean }
*
**/

require('./FloatBottomTip.scss');

let React = require('react');
let BackTop = require('./BackTop/BackTop.jsx');
let CompareBar = require('../CompareBar/CompareBar.jsx');

var FloatBottomTip = React.createClass({
  compareBarAddItem: function(item) {
    this.refs.compareBar.addItem(item);
  },
  componentDidMount: function() {

  },
  render: function() {
    return (
      <div className="float-bottom-tip">
        <CompareBar ref="compareBar" />
        <BackTop />
      </div>
    );
  },
});

module.exports = FloatBottomTip;
