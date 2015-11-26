'use strict';

//  ==================================================
//  Component: Header
//
//  Props: mainNav => object 主导航数据
//         shrink => boolean 主导航是否折叠
//
//  State: userInfo => object|null 登录状态
//         itemGroupData => object 商品组数据
//
//  Dependence: ItemGroup Header Slider Footer
//
//  TODO:
//  ==================================================

require('../../assets/pages/index.html');
require('./Home.scss');

let utils = require('../../lib/utils/utils');
let Ajax = require('reqwest');

let React = require('react');
let ReactDOM = require('react-dom');

let ItemGroup = require('./views/ItemGroup/ItemGroup.jsx');
let Header = require('../../lib/components/Header/Header.jsx');
let Slider = require('../../lib/components/Slider/Slider.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');

const MOCK_SLIDES = [
  {
    title: '标题',
    img: 'http://s.amazeui.org/media/i/demos/bing-1.jpg',
    url: ''
  }, {
    title: '标题',
    img: 'http://s.amazeui.org/media/i/demos/bing-2.jpg',
    url: '/'
  }, {
    title: '标题',
    img: 'http://s.amazeui.org/media/i/demos/bing-3.jpg',
    url: '/'
  }, {
    title: '标题',
    img: 'http://s.amazeui.org/media/i/demos/bing-4.jpg',
    url: '/'
  }
];

let Home = React.createClass({
  getInitialState: function() {
    return {
      userInfo: null,  // 登录状态
      itemGroupData: {}  // 商品组数据
    };
  },
  componentDidMount: function() {
    let _this = this;
    Ajax({  // 获取个人信息
      url: '/logined',
      method: 'get',
      success: function (res) {
        if(res.logined) {
          _this.setState({
            userInfo: res
          });
        }
      }
    })
    Ajax({  // 获取商品组信息
      url: '/navbar',
      method: 'get',
      success: function (res) {
        _this.setState({
          itemGroupData: res
        });
      }
    })
  },
  render: function() {
    let colors = [
      '#6e3800',
      '#5f0077',
      '#3abfb4'
    ];
    return (
      <div>
        <Header
          userInfo={this.state.userInfo}
          shrink={false}
        >
          <Slider slides={MOCK_SLIDES} />
        </Header>
        {Object.keys(this.state.itemGroupData).map((item, i) => {
          let guide = {
            title: this.state.itemGroupData[item].scene,
            img: '',
            url: '/item/?scene=' + item,
            color: colors[i]
          };
          return (
            <ItemGroup
              key={i}
              guide={guide}
              items={this.state.itemGroupData[item].items}
              color={colors[i]}
            />
          );
        })}
        <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <Home />,
  document.getElementById('content')
);
