'use strict';

require('./Header.scss')

let React= require('react');

//  ==================================================
//  Component: Header
//
//  Props:
//
//  Include:
//
//  Use:
//
//  TODO:
//  ==================================================

let TopBar = require('./TopBar/TopBar.jsx');
let Banner = require('./Banner/Banner.jsx');
let HeaderNav = require('./HeaderNav/HeaderNav.jsx');
let MainNav = require('./MainNav/MainNav.jsx');
let Slider = require('./Slider/Slider.jsx');

var Header = React.createClass({
  render: function() {
    return (
      <div className="header">
        <TopBar />
        <Banner />
        <HeaderNav {...this.props} />
        <MainNav />
        <Slider slides={this.props.slides} />
      </div>
    );
  }
});

module.exports = Header;
