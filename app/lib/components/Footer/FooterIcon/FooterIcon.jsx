'use strict';

require('./FooterIcon.scss')

let footerIconImg = require('../../../../assets/images/footer-icon.png');
let React= require('react');

//  ==================================================
//  Component: FooterIcon
//
//  Props:
//
//  Dependence:
//
//  Use: Footer
//
//  TODO:
//  ==================================================

var FooterIcon = React.createClass({
  render: function() {
    return (
      <div className="footer-icon">
        <img src={footerIconImg} />
      </div>
    );
  }
});

module.exports = FooterIcon;
