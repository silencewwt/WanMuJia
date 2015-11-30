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
    image: require('../../assets/images/slider_01_brand_jf.png'),
    description: '北京元亨利古典硬木家具以做“中华品牌、创世界品牌”为目标，经过多年的持续发展，积累了雄厚的实力，汇集了大批优秀的管理骨干和技艺精湛的艺术工匠。经典、传世的“元亨利通”明清古典硬木家具，精选印度、东南亚等国家的黄花梨、紫檀、黑檀、酸枝等名贵、珍稀硬木为原料，精心设计，由具有丰富宫廷家具制作经验的艺术工匠，采用纯手工精雕细琢，精心制作而成。'
  }, '12806': {
    image: require('../../assets/images/brand_banner_jf.png'),
    description: '劲飞红木家具厂位于北京回龙观北，它传承京作宫廷家具之风，创新发展现代古典居室文化。\n劲飞红木家具均为明清家具原款原版，品种齐全、用材考究，工艺严谨、精雕细琢，极具珍藏价值与保值增值潜力。\n劲飞红木家具以用料大气、造型严谨、重工雕琢，典雅端庄的宫廷家具风格，彰显出一派皇家的威仪和风范，是典藏、传世之首选。'
  }, '12836': {
    image: require('../../assets/images/brand_banner_dc.png'),
    description: '中山市东成家具有限公司是一家集研发、制造、销售和服务于一体的大型红木家具企业。\n东成始终坚持 “信誉为本、创造卓越、精久发展”的经营理念，坚持“一切以客户满意为核心”的服务宗旨，致力于为消费者提供一流的产品与服务。\n“情系红木传统，根植民族文化”。 东成人将始终秉持不断超越自我的企业精神，以顾客的信任为动力，弘扬中国传统家具文化。'
  }, '12803': {
    image: require('../../assets/images/brand_banner_jdy.png'),
    description: '君德益红木家具以“弘扬传统家具文化，打造传世典藏精品”为理念，打造出突出古典风韵与现代家具风格的两大系列产品。按明清古典家具图谱制作，纯仿古的家具，突出明式家具的简洁、明了、大气、线条优美；清式家具的重雕奢华，使每一件家具都是传世典藏的精品。\n现代家具是在明清古典家具的基础上略有改为，使之更适合现代人的审美和实用。并且在生产的过程中，力求每一件家具都达到“形、艺、材、韵”的最高境界。'
  }, '12801': {
    image: require('../../assets/images/brand_banner_jlt.png'),
    description: '东阳市盛世九龙堂红木家具有限公司，坐落于“歌山画水之地，人文荟萃之乡”的浙江东阳。主营黑酸枝木类的东非黑黄檀木雕收藏类家具及工艺品--紫光檀。是当今最重最硬的木材。本公司秉承“慢工出细活，细活出精品”的理念，打造出各种古典而时尚的红木家具。品种齐全、典雅大方、美观耐用、价格合理，集艺术价值、收藏价值、实用价值于一体。'
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
