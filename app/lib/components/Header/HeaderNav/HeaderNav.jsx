'use strict';

let React = require('react');

//  ==================================================
//  Component: MainNav
//
//  Props: navActive => integer 激活的按钮
//
//  Include:
//
//  Use: Home
//
//  TODO:
//  ==================================================

let HeaderNavBtn = React.createClass({
  render: function() {
    let itemClass = this.props.active ? "nav-item active" : "nav-item";
    return (
      <li className={itemClass}>
        <a
          href={this.props.item.link}
          title={this.props.item.title}
        >
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
          link: '/'
        }, {
          id: 1,
          title: '家具城',
          link: '/furniture'
        }, {
          id: 2,
          title: '品牌馆',
          link: '/brands'
        }
      ]
    }
  },
  render: function() {
    return (
      <div className="header-nav">
        {this.props.items.map((item, i) => {
          return <HeaderNavBtn
            item={item}
            key={i}
            active={this.props.navActive === i}
          />;
        })}
      </div>
    );
  }
});

module.exports = HeaderNav;
