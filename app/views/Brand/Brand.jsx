'use strict';

//  ==================================================
//  Component: Brands
//
//  Props:
//
//  State:
//
//  Dependence: Brands::Brand lib::Header lib::Footer
//
//  TODO:
//  ==================================================

require('../../assets/pages/brand_detail.html');
require('./Brand.scss')

let utils = require('../../lib/utils/utils');
let Ajax = require('reqwest');

let React = require('react');
let ReactDOM = require('react-dom');

let Header = require('../../lib/components/Header/Header.jsx');
let ItemGroup = require('./views/ItemGroup/ItemGroup.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');

const BRANDS_INFO = {
  '1': {
    image: '',
    description: '北京元亨利古典硬木家具以做“中华品牌、创世界品牌”为目标，经过多年的持续发展，积累了雄厚的实力，汇集了大批优秀的管理骨干和技艺精湛的艺术工匠。经典、传世的“元亨利通”明清古典硬木家具，精选印度、东南亚等国家的黄花梨、紫檀、黑檀、酸枝等名贵、珍稀硬木为原料，精心设计，由具有丰富宫廷家具制作经验的艺术工匠，采用纯手工精雕细琢，精心制作而成。'
  }
}

let Brands = React.createClass({
  getDefaultProps: function() {
    return {
      brandId: window.location.pathname.slice(8)
    };
  },
  getInitialState: function() {
    return {
      userInfo: null,  // 登录状态
      items: {}
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
      url: '/brands/' + this.props.brandId,
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
    return (
      <div>
        <Header
          shrink={true}
          userInfo={this.state.userInfo}
          navActive={2}
        />
        <Banner
          brandInfo={BRANDS_INFO[this.props.brandId]}
        />
        <div className="container">
          {Object.keys(this.state.items).map((id) => {
            return (
              <ItemGroup
                key={id}
                items={this.state.items[id].items}
                scene={this.state.items[id].scene}
                id={id}
              />
            );
          })}
        </div>
        <FloatBottomTip />
        <Footer />
      </div>
    );
  }
});

const Banner = React.createClass({
  render: function() {
    return (
      <div className="brand-banner">
        <img src={this.props.brandInfo.image} />
        <div className="container">
          <p className="brand-desc">
            {this.props.brandInfo.description}
          </p>
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <Brands />,
  document.getElementById('content')
);
