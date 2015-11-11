'use strict';

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

var CategoryItem = React.createClass({
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

var CategoryItemGroup = React.createClass({
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

var CategoryItems = React.createClass({
  render: function() {
    var itemsGroups;
    var subpartStyle = {
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

var Category = React.createClass({
  render: function() {
    return (
      <li className="category">
        <a href="#" className="am-icon-angle-right">{this.props.category.title}</a>
        <CategoryItems items={this.props.category.subpart} />
      </li>
    );
  }
});

var NavTitle = React.createClass({
  render: function() {
    var titleStyle = {
      backgroundColor: this.props.color
    };
    return (
      <div className="nav-title" style={titleStyle}>
        {this.props.title}
      </div>
    );
  }
});

var Nav = React.createClass({
  getDefaultProps: function() {
    return {
      title: '全部商品分类',
      color: '#411e00'
    }
  },
  render: function() {
    return (
      <div className="nav">
        <NavTitle title={this.props.title} color={this.props.color} />
        <ul className="category-list">
          {this.props.items.map(function(category, i) {
            return <Category category={category} key={i} index={i} />;
          }.bind(this))}
        </ul>
      </div>
    );
  }
});
