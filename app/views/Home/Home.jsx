'use strict';

//  ==================================================
//  Component: Header
//
//  Props: mainNav => object 主导航数据
//         shrink => boolean 主导航是否折叠
//
//  State: userInfo => object|null 登录状态
//         itemGroupData => object 商品组数据
//         elevator => boolean 快速导航是否显示
//         elevatorActive => integer|null  // 快速导航激活的 btn
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
let Elevator = require('./views/Elevator/Elevator.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');
let Header = require('../../lib/components/Header/Header.jsx');
let Slider = require('../../lib/components/Slider/Slider.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');

const SLIDER_IMG = [
  {
    title: '劲飞红木',
    img: require('../../assets/images/slider/slider_01_brand_jf.png'),
    url: '/brands/12806'
  }, {
    title: '东城红木',
    img: require('../../assets/images/slider/slider_02_brand_dc.png'),
    url: '/brands/12836'
  }, {
    title: '君得益红木',
    img: require('../../assets/images/slider/slider_03_brand_jdy.png'),
    url: '/brands/12803'
  }, {
    title: '九龙堂红木',
    img: require('../../assets/images/slider/slider_04_brand_jlt.png'),
    url: '/brands/12801'
  }
];

let Home = React.createClass({
  getInitialState: function() {
    return {
      userInfo: null,  // 登录状态
      itemGroupData: {},  // 商品组数据
      elevator: false, // 快速导航是否显示
      elevatorActive: null  // 快速导航激活的 btn
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
    Ajax({  // 获取商品组信息
      url: '/navbar',
      method: 'get',
      success: function (res) {
        _this.setState({
          itemGroupData: res
        });
      }
    });

    window.addEventListener('scroll', this.handleWindowScroll);
  },
  handleWindowScroll: function(e) {
    let scrollTop = document.body.scrollTop;
    if(scrollTop > 320) {
      this.setState({
        elevator: true,
        elevatorActive: parseInt((scrollTop - 320) / (560 + 20))
      });
    } else {
      this.setState({
        elevator: false
      });
    }
    console.log(scrollTop);
  },
  render: function() {
    const colors = {
      '2': '#6c0087',
      '3': '#549031',
      '4': '#a24b00',
      '5': '#459cc3',
      '6': '#86ad00'
    };

    const imgs = {
      '2': require('../../assets/images/scene/scene_02_sf.jpg'),
      '3': require('../../assets/images/scene/scene_03_kt.jpg'),
      '4': require('../../assets/images/scene/scene_04_ws.jpg'),
      '5': require('../../assets/images/scene/scene_05_cw.jpg'),
      '6': require('../../assets/images/scene/scene_06_ct.jpg')
    };
    let elevatorItems = [];
    for(let i in this.state.itemGroupData) {
      elevatorItems.push({
        id: i,
        title: this.state.itemGroupData[i].scene,
        color: colors[i]
      });
    }

    return (
      <div>
        <Header
          userInfo={this.state.userInfo}
          shrink={false}
        >
          <Slider slides={SLIDER_IMG} />
        </Header>
        {Object.keys(this.state.itemGroupData).map((item, i) => {
          let guide = {
            title: this.state.itemGroupData[item].scene,
            img: imgs[item],
            url: '/item/?scene=' + item,
            color: colors[item],
            id: item
          };
          return (
            <ItemGroup
              key={i}
              guide={guide}
              items={this.state.itemGroupData[item].items}
              color={colors[item]}
            />
          );
        })}
        {
          this.state.elevator ?
          <Elevator
            items={elevatorItems}
            active={this.state.elevatorActive}
          /> :
          null
        }
        <FloatBottomTip />
        <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <Home />,
  document.getElementById('content')
);
