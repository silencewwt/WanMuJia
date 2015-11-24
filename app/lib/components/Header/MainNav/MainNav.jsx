'use strict';

let React = require('react');

//  ==================================================
//  Component: MainNav
//
//  Props: items => object 主导航内容
//         title => string 主导航 title 文字
//         color => string 主导航 title 背景色
//         shrink => boolean 主导航是否折叠
//
//  Dependence:
//
//  TODO:
//  ==================================================

const MOCK_NAV_ITEMS = [
  {
    id: 0,
    title: '客厅',
    subpart: [
      {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/48/ec24e25b1b35f42c93efb219b2c9efe2/8a943ecab51d4d30b0a1e3bf2412bcbc.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/48/ec24e25b1b35f42c93efb219b2c9efe2/8a943ecab51d4d30b0a1e3bf2412bcbc.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/2b78d158cd2474ed941b1e782b995711.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/76/ae51fa24c7c4fa6243d9d15272c1a854/80630a0eae3bf2f129bce648853dd456.jpg'
      }, {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/19/cc63c7dd760ea712b691b2f7c461b1e0/f1347f321d61444c1a7261e326acb40e.jpg'
      }, {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/30/37d43b2f5ade643361cd1aaad044a6c3/9b9d71fd85ad09f9adb72c11b62b979c.jpg'
      }, {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/68/7eae98baa74e9e765393753444acaa2c/56318d3866295125f817f2ca43f66111.jpg'
      }
    ]
  }, {
    id: 1,
    title: '书房',
    subpart: [
      {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }
    ]
  }, {
    id: 2,
    title: '卧室',
    subpart: [
      {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/48/ec24e25b1b35f42c93efb219b2c9efe2/8a943ecab51d4d30b0a1e3bf2412bcbc.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/2b78d158cd2474ed941b1e782b995711.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }
    ]
  }, {
    id: 3,
    title: '餐厅',
    subpart: [
      {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/30/37d43b2f5ade643361cd1aaad044a6c3/9b9d71fd85ad09f9adb72c11b62b979c.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/48/ec24e25b1b35f42c93efb219b2c9efe2/8a943ecab51d4d30b0a1e3bf2412bcbc.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/2b78d158cd2474ed941b1e782b995711.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }
    ]
  }, {
    id: 4,
    title: '厨卫',
    subpart: [
      {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/2b78d158cd2474ed941b1e782b995711.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }, {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/30/37d43b2f5ade643361cd1aaad044a6c3/9b9d71fd85ad09f9adb72c11b62b979c.jpg'
      }
    ]
  }
];

let MainNav = React.createClass({
  getDefaultProps: function() {
    return {
      title: '全部商品分类',
      color: '#411e00',
      shrink: false,
      items: MOCK_NAV_ITEMS
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

let CategoryItem = React.createClass({
  render: function() {
    return (
      <li className="category-item">
        <a href={'/item/' + this.props.item.id}>
          <img
            src={this.props.item.img}
            alt={this.props.item.title}
            title={this.props.item.title}
          />
          <span
            className="item-title"
            title={this.props.item.title}
          >
            {this.props.item.title}
          </span>
        </a>
        <a
          href={'/item/' + this.props.item.id}
          className="item-btn"
        >
          查看
        </a>
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
    if(this.props.items.subpart.length > 6) {
      itemsGroups = [
        <CategoryItemGroup items={this.props.items.subpart.slice(0, 3)} key={0} />,
        <CategoryItemGroup items={this.props.items.subpart.slice(3, 6)} key={1} />,
        <CategoryItemGroup items={this.props.items.subpart.slice(6, 9)} key={2} />
      ];
    } else if (this.props.items.subpart.length > 3) {
      itemsGroups = [
        <CategoryItemGroup items={this.props.items.subpart.slice(0, 3)} key={0} />,
        <CategoryItemGroup items={this.props.items.subpart.slice(3, 6)} key={1} />
      ];
      subpartStyle.width -= 270;
    } else {
      itemsGroups = [
        <CategoryItemGroup items={this.props.items.subpart.slice(0, 3)} key={0} />
      ];
      subpartStyle.width -= 270 * 2;
    }
    return (
      <div className="category-subpart" style={subpartStyle}>
        {itemsGroups}
        <div className="category-more">
          <a href={'/item/?scene=' + this.props.items.id}>查看更多</a>
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
        <CategoryItems items={this.props.category} />
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


module.exports = MainNav;
