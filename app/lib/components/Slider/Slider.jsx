'use strict';

require('./Slider.scss');

let React = require('react');
let AMUIReact = require('amazeui-react');

//  ==================================================
//  Component: Slider
//
//  Props:
//
//  Include:
//
//  Use:  Header
//
//  TODO:
//  ==================================================

var Slider = React.createClass({
  render: function() {
    return (
      <div className="slider">
        <div className="container">
          <AMUIReact.Slider theme="a1" slideSpeed="350">
            {this.props.slides.map(function(item, i) {
              return (
                <AMUIReact.Slider.Item key={i}>
                  <a href={item.url} title={item.title}>
                    <img src={item.img} />
                  </a>
                </AMUIReact.Slider.Item>
              );
            })}
          </AMUIReact.Slider>
        </div>
      </div>
    );
  }
});

module.exports = Slider;
