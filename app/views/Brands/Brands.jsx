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
let Footer = require('../../lib/components/Footer/Footer.jsx');

let Brands = React.createClass({
  getInitialState: function() {
    return {
      brands: {}
    };
  },
  componentDidMount: function() {
    let _this = this;
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
    })
  },
  render: function() {
    return (
      <div>
        <Header shrink={true} />
        <div className="container">
          {Object.keys(this.state.brands).map((id) => {
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
        <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <Brands />,
  document.getElementById('content')
);
