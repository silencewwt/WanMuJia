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
    id: 3,
    title: '客厅',
    subpart: [
      {
        id: 71,
        title: '月牙桌',
        img: require('../../../../assets/images/main_nav/nav_01_01.jpg')
      }, {
        id: 156,
        title: '联三橱',
        img: require('../../../../assets/images/main_nav/nav_01_02.jpg')
      }, {
        id: 99,
        title: '条桌',
        img: require('../../../../assets/images/main_nav/nav_01_03.jpg')
      }, {
        id: 109,
        title: '四足方香几',
        img: require('../../../../assets/images/main_nav/nav_01_04.jpg')
      }, {
        id: 26,
        title: '皇宫椅',
        img: require('../../../../assets/images/main_nav/nav_01_05.jpg')
      }, {
        id: 200,
        title: '电视柜',
        img: require('../../../../assets/images/main_nav/nav_01_06.jpg')
      }, {
        id: 19,
        title: '官帽椅',
        img: require('../../../../assets/images/main_nav/nav_01_07.jpg')
      }, {
        id: 75,
        title: '抽屉桌',
        img: require('../../../../assets/images/main_nav/nav_01_08.jpg')
      }, {
        id: 78,
        title: '茶几',
        img: require('../../../../assets/images/main_nav/nav_01_09.jpg')
      }
    ]
  }, {
    id: 2,
    title: '书房',
    subpart: [
      {
        id: 68,
        title: '书桌',
        img: require('../../../../assets/images/main_nav/nav_03_01.jpg')
      }, {
        id: 201,
        title: '书柜',
        img: require('../../../../assets/images/main_nav/nav_03_02.jpg')
      }, {
        id: 134,
        title: '罗汉床',
        img: require('../../../../assets/images/main_nav/nav_03_03.jpg')
      }, {
        id: 225,
        title: '写字台',
        img: require('../../../../assets/images/main_nav/nav_03_04.jpg')
      }, {
        id: 202,
        title: '多宝格',
        img: require('../../../../assets/images/main_nav/nav_03_05.jpg')
      }, {
        id: 177,
        title: '博古架',
        img: require('../../../../assets/images/main_nav/nav_03_06.jpg')
      }
    ]
  }, {
    id: 4,
    title: '卧室',
    subpart: [
      {
        id: 182,
        title: '变体圆角柜',
        img: require('../../../../assets/images/main_nav/nav_02_01.jpg')
      }, {
        id: 207,
        title: '衣帽柜',
        img: require('../../../../assets/images/main_nav/nav_02_02.jpg')
      }, {
        id: 206,
        title: '鞋柜',
        img: require('../../../../assets/images/main_nav/nav_02_03.jpg')
      }, {
        id: 208,
        title: '梳妆台',
        img: require('../../../../assets/images/main_nav/nav_02_04.jpg')
      }, {
        id: 150,
        title: '大床',
        img: require('../../../../assets/images/main_nav/nav_02_05.jpg')
      }, {
        id: 161,
        title: '上箱下柜',
        img: require('../../../../assets/images/main_nav/nav_02_06.jpg')
      }, {
        id: 199,
        title: '大衣柜',
        img: require('../../../../assets/images/main_nav/nav_02_07.jpg')
      }, {
        id: 165,
        title: '大方角柜',
        img: require('../../../../assets/images/main_nav/nav_02_08.jpg')
      }
    ]
  }, {
    id: 6,
    title: '餐厅',
    subpart: [
      {
        id: 76,
        title: '圆桌（圆台）',
        img: require('../../../../assets/images/main_nav/nav_04_01.jpg')
      }, {
        id: 104,
        title: '四方桌',
        img: require('../../../../assets/images/main_nav/nav_04_02.jpg')
      }, {
        id: 204,
        title: '酒柜',
        img: require('../../../../assets/images/main_nav/nav_04_03.jpg')
      }
    ]
  }, {
    id: 5,
    title: '厨卫',
    subpart: [
      {
        id: 158,
        title: '方角柜',
        img: require('../../../../assets/images/main_nav/nav_05_01.jpg')
      }
    ]
  }
];

let MainNav = React.createClass({
  getDefaultProps: function() {
    return {
      title: '全部商品分类',
      color: '#502500',
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
            return <Category category={category} key={i} />;
          }.bind(this))}
        </ul>
      </div>
    );
  }
});

let CategoryItem = React.createClass({
  render: function() {
    let url = '/item/?scene=' + this.props.category + '&category=' + this.props.item.id;
    return (
      <li className="category-item">
        <a href={url}>
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
          href={url}
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
        {this.props.items.map((item, i) => {
          return (
            <CategoryItem
              item={item}
              key={i}
              category={this.props.category}
            />
          );
        })}
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
        <CategoryItemGroup
          items={this.props.items.subpart.slice(0, 3)}
          key={0}
          category={this.props.items.id}
        />,
        <CategoryItemGroup
          items={this.props.items.subpart.slice(3, 6)}
          key={1}
          category={this.props.items.id} />,
        <CategoryItemGroup
          items={this.props.items.subpart.slice(6, 9)}
          key={2}
          category={this.props.items.id}
        />
      ];
    } else if (this.props.items.subpart.length > 3) {
      itemsGroups = [
        <CategoryItemGroup
          items={this.props.items.subpart.slice(0, 3)}
          key={0}
          category={this.props.items.id}
        />,
        <CategoryItemGroup
          items={this.props.items.subpart.slice(3, 6)}
          key={1}
          category={this.props.items.id}
        />
      ];
      subpartStyle.width -= 270;
    } else if (this.props.items.subpart.length > 0) {
      itemsGroups = [
        <CategoryItemGroup
          items={this.props.items.subpart.slice(0, 3)}
          key={0}
          category={this.props.items.id}
        />
      ];
      subpartStyle.width -= 270 * 2;
    } else {
      itemsGroups = [];
      subpartStyle.width = 0;
    }
    return (
      <div className="category-subpart" style={subpartStyle}>
        {itemsGroups}
        {
          itemsGroups.length ?
          <div className="category-more">
            <a href={'/item/?scene=' + this.props.items.id} title="查看更多">
              查看更多
            </a>
          </div> :
          null
        }
      </div>
    );
  }
});

let Category = React.createClass({
  render: function() {
    return (
      <li className="category">
        <a
          style={{
            cursor: 'pointer'
          }}
        >
          {this.props.category.title}
          <i className="am-icon-angle-right"></i>
        </a>
        <CategoryItems items={this.props.category} />
      </li>
    );
  }
});

let NavTitle = React.createClass({
  render: function() {
    let titleStyle = {
      backgroundColor: this.props.color,
      cursor: this.props.shrink ? 'pointer' : 'default'
    };

    return (
      <div
        className="nav-title"
        style={titleStyle}
      >
        {this.props.title}
        {
          this.props.shrink ?
          <i className="am-icon-chevron-down"></i> :
          null
        }
      </div>
    );
  }
});


module.exports = MainNav;
