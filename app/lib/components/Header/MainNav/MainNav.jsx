'use strict';

let React = require('react');

//  ==================================================
//  Component: MainNav
//
//  Props:
//
//  Include:
//
//  Use: Header
//
//  TODO:
//  ==================================================

var MainNavBtn = React.createClass({
  render: function() {
    var itemClass = this.props.item.active ? "nav-main-item active" : "nav-main-item";
    return (
      <li className={itemClass}>
        <a href={this.props.item.link} title={this.props.item.title}>
          {this.props.item.title}
        </a>
      </li>
    );
  }
});

var MainNav = React.createClass({
  getDefaultProps: function() {
    return {
      items: [
        {
          id: 0,
          title: '首页',
          link: '/index',
          active: true
        }, {
          id: 1,
          title: '家具城',
          link: '/overview'
        }, {
          id: 2,
          title: '品牌馆',
          link: '/brand'
        }, {
          id: 3,
          title: '红木百科',
          link: '/baike'
        }
      ]
    }
  },
  render: function() {
    return (
      <div className="nav-main">
        {this.props.items.map(function(item, i) {
          return <MainNavBtn item={item} key={i} />;
        })}
      </div>
    );
  }
});

module.exports = MainNav;
