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

require('../../assets/pages/brands.html');
require('./Brands.scss');

require('./Brands.scss')

let utils = require('../../lib/utils/utils');
let Ajax = require('reqwest');

let React = require('react');
let ReactDOM = require('react-dom');

let Header = require('../../lib/components/Header/Header.jsx');
let Brand = require('./views/Brand/Brand.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');

const BRANDS_SORT = [12806, 12803, 12836, 12801];

let Brands = React.createClass({
  getInitialState: function() {
    return {
      userInfo: null,  // 登录状态
      brands: {}
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
    Ajax({  // 获取品牌信息列表
      url: '/brands',
      method: 'get',
      data: {
        format: 'json'
      },
      success: function (res) {
        if(res) {
          _this.setState({
            brands: res
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
        <div className="container">
          {BRANDS_SORT.map((id) => {
            if(!this.state.brands.hasOwnProperty(id)) {
              return;
            }
            return (
              <Brand
                key={id}
                items={this.state.brands[id].items}
                brand={this.state.brands[id].brand}
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

ReactDOM.render(
  <Brands />,
  document.getElementById('content')
);