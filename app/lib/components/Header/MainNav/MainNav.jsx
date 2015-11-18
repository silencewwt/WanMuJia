'use strict';

let React = require('react');

//  ==================================================
//  Component: Nav
//
//  Props:  items
//
//  Include: Nav
//
//  Use: index.html
//
//  TODO:
//  ==================================================

let CategoryItem = React.createClass({
  render: function() {
    return (
      <li className="category-item">
        <img src={this.props.item.img} alt={this.props.item.title} title={this.props.item.title} />
        <span className="item-title" title={this.props.item.title}>
          {this.props.item.title}
        </span>
        <span className="item-btn">查看</span>
      </li>
    );
  }
});

let CategoryItemGroup = React.createClass({
  render: function() {
    return (
      <ul className="category-items">
        {this.props.items.map(function(item, i) {
          return <CategoryItem item={item} key={i} />;
        }.bind(this))}
      </ul>
    );
  }
});

let CategoryItems = React.createClass({
  render: function() {
    let itemsGroups;
    let subpartStyle = {
      width: 961
    };
    if(this.props.items.length > 6) {
      itemsGroups = [
        <CategoryItemGroup items={this.props.items.slice(0, 3)} key={0} />,
        <CategoryItemGroup items={this.props.items.slice(3, 6)} key={1} />,
        <CategoryItemGroup items={this.props.items.slice(6, 9)} key={2} />
      ];
    } else if (this.props.items.length > 3) {
      itemsGroups = [
        <CategoryItemGroup items={this.props.items.slice(0, 3)} key={0} />,
        <CategoryItemGroup items={this.props.items.slice(3, 6)} key={1} />
      ];
      subpartStyle.width -= 270;
    } else {
      itemsGroups = [
        <CategoryItemGroup items={this.props.items.slice(0, 3)} key={0} />
      ];
      subpartStyle.width -= 270 * 2;
    }
    return (
      <div className="category-subpart" style={subpartStyle}>
        {itemsGroups}
        <div className="category-more">
          <a href="#">查看更多</a>
        </div>
      </div>
    );
  }
});

let Category = React.createClass({
  render: function() {
    return (
      <li className="category">
        <a
          href="#"
          className="am-icon-angle-right"
        >
          {this.props.category.title}
        </a>
        <CategoryItems items={this.props.category.subpart} />
      </li>
    );
  }
});

let NavTitle = React.createClass({
  render: function() {
    let titleStyle = {
      paddingRight: 10,
      backgroundColor: this.props.color,
      cursor: this.props.shrink ? 'pointer' : 'default'
    };
    let titleClass = 'nav-title';
    if(this.props.shrink) {
      titleClass += ' am-icon-chevron-down';
    }

    return (
      <div
        className={titleClass}
        style={titleStyle}
      >
        {this.props.title}
      </div>
    );
  }
});

let Nav = React.createClass({
  getDefaultProps: function() {
    return {
      title: '全部商品分类',
      color: '#411e00',
      shrink: false
    }
  },
  render: function() {
    let ulStyle = {
      display: this.props.shrink ? 'none' : 'block'
    };
    return (
      <div className="main-nav">
        <NavTitle
          title={this.props.title}
          color={this.props.color}
          shrink={this.props.shrink}
        />
        <ul
          className="category-list"
          style={ulStyle}
        >
          {this.props.items.map(function(category, i) {
            return <Category category={category} key={i} index={i} />;
          }.bind(this))}
        </ul>
      </div>
    );
  }
});

module.exports = Nav;
