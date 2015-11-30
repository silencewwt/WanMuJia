'use strict';

//  ==================================================
//  Component: Furniture
//
//  Props:
//
//  State:
//
//  Dependence:
//
//  TODO:
//  ==================================================

require('../../assets/pages/furniture.html');
require('./Furniture.scss');

let Ajax = require('reqwest');

let React = require('react');
let ReactDOM = require('react-dom');

let Header = require('../../lib/components/Header/Header.jsx');
let ItemGroup = require('../Home/views/ItemGroup/ItemGroup.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');

let Furniture = React.createClass({
  getInitialState: function() {
    return {
      userInfo: null,  // 登录状态
      items: {}  // 商品组数据
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
    });
    Ajax({  // 获取商品列表
      url: '/furniture',
      method: 'get',
      data: {
        format: 'json'
      },
      success: function (res) {
        if(res) {
          _this.setState({
            items: res
          });
        }
      }
    });
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
          shrink={true}
          navActive={1}
        />
        {Object.keys(this.state.items).map((id) => {
          let guide = {
            title: this.state.items[id].style,
            img: '',
            url: '/item/?style=' + id,
            color: colors[id] || colors[0]
          };
          return (
            <ItemGroup
              key={id}
              guide={guide}
              items={this.state.items[id].items}
              color={guide.color}
            />
          );
        })}
        <FloatBottomTip />
        <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <Furniture />,
  document.getElementById('content')
);
