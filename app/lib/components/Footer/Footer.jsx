'use strict';

require('./Footer.scss')

let React= require('react');
let FooterIcon= require('./FooterIcon/FooterIcon.jsx');
let FooterRight= require('./FooterRights/FooterRights.jsx');
let FooterLink= require('./FooterLink/FooterLink.jsx');

//  ==================================================
//  Component: Footer
//
//  Props:
//
//  Dependence: FooterIcon FooterLink FooterRight
//
//  Use:
//
//  TODO:
//  ==================================================

var Footer = React.createClass({
  render: function() {
    return (
      <div className="footer">
        <FooterIcon />
        <FooterLink />
        <FooterRight />
      </div>
    );
  }
});

module.exports = Footer;
