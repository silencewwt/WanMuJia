'use strict';

require('./BackTop.scss');

let React = require('react');

var BackTop = React.createClass({
  handleClick: function() {
    this.timer = setInterval(function() {
      var currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      currentScrollTop -= 40;
      if(currentScrollTop > 0) {
        window.scrollTo(0 , currentScrollTop);
      } else {
        window.scrollTo(0 , 0);
        clearInterval(this.timer);
      }
    }.bind(this) , 1);
  },
  render: function() {
    return (
      <div className="back-top" onClick={this.handleClick}>
        <div className="back-top-tip">返回顶部</div>
      </div>
    );
  },
});

module.exports = BackTop;
