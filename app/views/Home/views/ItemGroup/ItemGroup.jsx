'use strict';

let React = require('react');
let Items = require('../../../../lib/components/Items/Items.jsx');

//  ==================================================
//  Component: ItemGoup
//
//  Props: items  商品列表
//         color  GuideTtle 背景颜色
//
//  Include: GroupGuide
//
//  Use: Home
//
//  TODO:
//  ==================================================

const GroupGuide = React.createClass({
  getDefaultProps: function() {
    color: '#833e00'
  },
  render: function() {
    const titleStyle = {
      backgroundColor: this.props.color
    };
    return (
      <div className="group-guide">
        <div className="guide-title" style={titleStyle}>
          <a href={this.props.guide.url}>
            {this.props.guide.title}
          </a>
          <a href={this.props.guide.url} className="more am-icon-angle-right">更多</a>
        </div>
        <a href={this.props.guide.url} title={this.props.guide.title}>
          <img
            src={this.props.guide.img}
            alt={this.props.guide.title}
            className="guide-img"
          />
        </a>
      </div>
    );
  }
});

const ItemGroup = React.createClass({
  getDefaultProps: function() {
    color: '#833e00'
  },
  render: function() {
    return (
      <div className="item-group">
        <div className="container">
          <GroupGuide
            guide={this.props.guide}
            color={this.props.color}
          />
          <Items
            items={this.props.items}
            color={this.props.color}
            theme="tight"
          />
        </div>
      </div>
    );
  }
});

module.exports = ItemGroup;
