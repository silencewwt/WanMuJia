'use strict';

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
      <AMUIReact.Slider>
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
    );
  }
});

module.exports = Slider;
