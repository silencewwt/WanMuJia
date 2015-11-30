'use strict';

//  ==================================================
//  Component: Brands
//
//  Props:
//
//  State:
//
//  Dependence: lib::Items npm::reqwest
//
//  TODO:
//  ==================================================

let Ajax = require('reqwest');
let Items = require('../../../../lib/components/Items/Items.jsx');

const BRANDS_INFO = {
  '1': {
    id: 1,
    brand: '创汇传媒',
    image: require('../../../../assets/images/slider/slider_01_brand_jf.png')
  },
  '12801': {
    id: 12801,
    brand: '九龙堂',
    image: require('../../../../assets/images/brand/brand_banner_jlt.png')
  },
  '12803': {
    id: 12803,
    brand: '君得益',
    image: require('../../../../assets/images/brand/brand_banner_jdy.png')
  },
  '12806': {
    id: 12806,
    brand: '劲飞红木',
    image: require('../../../../assets/images/brand/brand_banner_jf.png')
  },
  '12836': {
    id: 12836,
    brand: '东成',
    image: require('../../../../assets/images/brand/brand_banner_dc.png')
  }
};

let Brand = React.createClass({
  render: function() {
    return (
      <div className="brand">
        <Banner
          brandInfo={BRANDS_INFO[this.props.id]}
        />
        <Main items={this.props.items} />
      </div>
    );
  }
});

let Banner = React.createClass({
  render: function() {
    return (
      <div className="banner">
        <a href={'brands/' + this.props.brandInfo.id}>
          <image src={this.props.brandInfo.image} />
        </a>
        <div className="title">
          <span className="text">精品推荐</span>
          <a href={'brands/' + this.props.brandInfo.id} className="more">更多</a>
        </div>
      </div>
    );
  }
});

let Main = React.createClass({
  render: function() {
    return (
      <Items
        items={this.props.items}
        theme="tight lg"
      />
    );
  }
});

module.exports = Brand;
