'use strict';

let React = require('react');

//  ==================================================
//  Component: MainNav
//
//  Props:
//
//  Include:
//
//  Use: Home
//
//  TODO:
//  ==================================================

let HeaderNavBtn = React.createClass({
  render: function() {
    let itemClass = this.props.item.active ? "nav-item active" : "nav-item";
    return (
      <li className={itemClass}>
        <a href={this.props.item.link} title={this.props.item.title}>
          {this.props.item.title}
        </a>
      </li>
    );
  }
});

let HeaderNav = React.createClass({
  getDefaultProps: function() {
    return {
      items: [
        {
          id: 0,
          title: '首页',
          link: '/',
          active: true
        }, {
          id: 1,
          title: '家具城',
          link: '/furniture'
        }, {
          id: 2,
          title: '品牌馆',
          link: '/brands'
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
      <div className="header-nav">
        {this.props.items.map(function(item, i) {
          return <HeaderNavBtn item={item} key={i} />;
        })}
      </div>
    );
  }
});

module.exports = HeaderNav;
