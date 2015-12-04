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

const STYLE_SORT = [2, 3, 1, 4, 5, 6];

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
    const colors = [
      '#a24b00',
      '#6c0087',
      '#86ad00',
      '#549031',
      '#459cc3'
    ];
    const imgs = {
      '1': require('../../assets/images/style/style_01_gd.jpg'),
      '2': require('../../assets/images/style/style_02_ms.jpg'),
      '3': require('../../assets/images/style/style_03_qs.jpg'),
      '4': require('../../assets/images/style/style_04_xzs.jpg'),
      '5': require('../../assets/images/style/style_05_xgd.jpg'),
      '6': require('../../assets/images/style/style_06_qt.jpg')
    };
    return (
      <div>
        <Header
          userInfo={this.state.userInfo}
          shrink={true}
          navActive={1}
        />
      {STYLE_SORT.map((id, i) => {
          if(!this.state.items.hasOwnProperty(id)) {
            return;
          }
          let guide = {
            title: this.state.items[id].style,
            img: imgs[id],
            url: '/item/?style=' + id,
            color: colors[i]
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
