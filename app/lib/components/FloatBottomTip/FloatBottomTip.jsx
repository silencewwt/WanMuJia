'use strict';

require('./FloatBottomTip.scss');

let React = require('react');
let BackTop = require('./BackTop/BackTop.jsx');
let CompareBar = require('../CompareBar/CompareBar.jsx');

var FloatBottomTip = React.createClass({
  compareBarAddItem: function(item) {
    this.refs.compareBar.addItem(item);
  },
  componentDidMount: function() {
    setTimeout(function() {
      this.compareBarAddItem({
        id: 2,
        image_url: 'http://static.wanmujia.com/images/item/51/8fd2b6a905998718475dc7247ef2b9bc/e46a0c76b5b4067acbf2361fba71daeb.jpg',
        item: '小叶檀梅花条案',
        price: 368000
      });
    }.bind(this) , 3000);
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
