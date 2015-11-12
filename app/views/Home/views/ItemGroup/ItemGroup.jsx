'use strict';

require('./ItemGroup.scss');

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
  render: function() {
    const titleStyle = {
      bakcgroundColor: this.props.guide.color
    };
    return (
      <div className="group-guide">
        <div className="guide-title" style={titleStyle}>
          <a href={this.props.guide.url}>
            {this.props.guide.title}
          </a>
          <a href="/more" className="more am-icon-angle-right">更多</a>
        </div>
        <img
          src={this.props.guide.img}
          alt={this.props.guide.title}
          className="guide-img"
        />
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
        <GroupGuide guide={this.props.guide} />
        <Items
          items={this.props.items}
          color={this.props.guide.color}
          theme="tight"
        />
      </div>
    );
  }
});

module.exports = ItemGroup;
