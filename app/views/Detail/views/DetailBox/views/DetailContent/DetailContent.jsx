'use strict';

require('./DetailContent.scss')
let React = require('react');
let utils = require('../../../../../../lib/utils/utils.js');
let isArray = utils.isArray;

var DetailContent = React.createClass({
  getInitialState: function() {
    return {
      tab: "detail",
    };
  },
  tabClick: function(tab) {
    if(tab == this.state.tab) return ;
    this.setState({tab: tab});
  },
  render: function() {
    var isSuite = this.props.data.is_suite;
    return (
      <div className="d-content">
        <Tab isSuite={isSuite} tab={this.state.tab} tabClick={this.tabClick} />
        <Cont isSuite={isSuite} tab= {this.state.tab} data={this.props.data} />
      </div>
    );
  }
});

var Tab = React.createClass({
  render: function() {
    return (
      <div className="tab">
        <div
          className={(this.props.tab=="detail"?"active ":"")+"detail-tab"}
          onClick={this.props.tabClick.bind(null,"detail")}>
          商品详情
        </div>
        {
          this.props.isSuite?
          <div
            className={(this.props.tab=="suite"?"active ":"")+"suite-tab"}
            onClick={this.props.tabClick.bind(null,"suite")}>
            组件规格
          </div>
          :null
        }
      </div>
    );
  }
});

var Cont = React.createClass({
  render: function() {
    var contNode = (function(tab, data) {
      if(tab == "detail") return <ContDetail data={data} />;
      if(tab == "suite") return <ContSuite data={data} />;
    })(this.props.tab, this.props.data);
    return (
      <div className="cont">
        {contNode}
      </div>
    );
  }
});

var ContDetail = React.createClass({
  render: function() {
    return (
      <div className="cont-detail">
        <ContDetailArr data={this.props.data} />
        <ContDetailImgs data={this.props.data} />
      </div>
    );
  }
});

var ContDetailArr = React.createClass({
  render: function() {
    var data = {};
    for(let key in this.props.data) {
      data[key] = this.props.data[key];
    }
    for(let key in data) {
      if(isArray(data[key])) { data[key] = data[key].join('、'); }
      if(data[key] === 0 || data[key] === "0") { data[key] = ""; }
    }
    if(!data.is_suite) {
      return (
        <div className="attr-box clearfix">
          <div className="i-box">
            <div className="title">商品名称：</div>
            <div className="attr">{data.item}</div>
          </div>
          <div className="i-box">
            <div className="title">品牌名：</div>
            <div className="attr">{data.brand}</div>
          </div>
          <div className="i-box">
            <div className="title">商品尺寸：</div>
            <div className="attr">{data.size + " cm*cm*cm"}</div>
          </div>
          <div className="i-box">
            <div className="title">适用面积：</div>
            <div className="attr">{data.item + "平方米"}</div>
          </div>
          <div className="i-box">
            <div className="title">指导价格：</div>
            <div className="attr">{data.price + "元"}</div>
          </div>
          <div className="i-box">
            <div className="title">风格：</div>
            <div className="attr">{data.style}</div>
          </div>
          <div className="i-box">
            <div className="title">场景：</div>
            <div className="attr">{data.scene}</div>
          </div>
          <div className="i-box">
            <div className="title">种类：</div>
            <div className="attr">{data.category}</div>
          </div>
          <div className="i-box">
            <div className="title">材料：</div>
            <div className="attr">{data.second_material}</div>
          </div>
          <div className="i-box">
            <div className="title">烘干工艺：</div>
            <div className="attr">{data.stove}</div>
          </div>
          <div className="i-box">
            <div className="title">外表面打磨砂纸：</div>
            <div className="attr">{data.outside_sand}</div>
          </div>
          <div className="i-box">
            <div className="title">内表面打磨砂纸：</div>
            <div className="attr">{data.inside_sand}</div>
          </div>
          <div className="i-box">
            <div className="title">雕刻工艺：</div>
            <div className="attr">{data.carve}</div>
          </div>
          <div className="i-box">
            <div className="title">涂饰工艺：</div>
            <div className="attr">{data.paint}</div>
          </div>
          <div className="i-box">
            <div className="title">装饰工艺：</div>
            <div className="attr">{data.decoration}</div>
          </div>
          <div className="i-box">
            <div className="title">结构：</div>
            <div className="attr">{data.tenon || "榫卯"}</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="attr-box clearfix">
          <div className="i-box">
            <div className="title">商品名称：</div>
            <div className="attr">{data.item}</div>
          </div>
          <div className="i-box">
            <div className="title">品牌名：</div>
            <div className="attr">{data.brand}</div>
          </div>
          <div className="i-box">
            <div className="title">适用面积：</div>
            <div className="attr">{data.area + "平方米"}</div>
          </div>
          <div className="i-box">
            <div className="title">指导价格：</div>
            <div className="attr">{data.price + "元"}</div>
          </div>
          <div className="i-box">
            <div className="title">风格：</div>
            <div className="attr">{data.style}</div>
          </div>
          <div className="i-box">
            <div className="title">场景：</div>
            <div className="attr">{data.scene}</div>
          </div>
          <div className="i-box">
            <div className="title">材料：</div>
            <div className="attr">{data.second_material}</div>
          </div>
          <div className="i-box">
            <div className="title">烘干工艺：</div>
            <div className="attr">{data.stove}</div>
          </div>
          <div className="i-box">
            <div className="title">外表面打磨砂纸：</div>
            <div className="attr">{data.outside_sand}</div>
          </div>
          <div className="i-box">
            <div className="title">内表面打磨砂纸：</div>
            <div className="attr">{data.inside_sand}</div>
          </div>
          <div className="i-box">
            <div className="title">组件数量和：</div>
            <div className="attr">{this.props.data.components.length + "件"}</div>
          </div>
        </div>
      );
    }
  }
});

var ContDetailImgs = React.createClass({
  render: function() {
    let item = this.props.data.item;
    var imgsNode = this.props.data.images.map(function(src, idx) {
      if(idx < 4) return ;
      return (
        <div className="img" key={"b-img"+idx}>
          <img src={src} alt={item} key={"d-img"+idx} />
        </div>
      );
    });
    return (
      <div className="d-imgs">
        {imgsNode}
      </div>
    );
  }
});

var ContSuite = React.createClass({
  render: function() {
    var componentsData = this.props.data.components;
    var comNodes = componentsData.map(function(data,idx) {
      return (
        <div className="attr-box clearfix" key={'com'+idx}>
          <div className="i-box">
            <div className="title">商品名称：</div>
            <div className="attr">{data.item}</div>
          </div>
          <div className="i-box">
            <div className="title">商品尺寸：</div>
            <div className="attr">{data.size + " cm*cm*cm"}</div>
          </div>
          <div className="i-box">
            <div className="title">适用面积：</div>
            <div className="attr">{data.area + "平方米"}</div>
          </div>
          <div className="i-box">
            <div className="title">种类：</div>
            <div className="attr">{data.category}</div>
          </div>
          <div className="i-box">
            <div className="title">雕刻工艺：</div>
            <div className="attr">{data.carve}</div>
          </div>
          <div className="i-box">
            <div className="title">涂饰工艺：</div>
            <div className="attr">{data.paint}</div>
          </div>
          <div className="i-box">
            <div className="title">装饰工艺：</div>
            <div className="attr">{data.decoration}</div>
          </div>
          <div className="i-box">
            <div className="title">结构：</div>
            <div className="attr">{data.tenon || "榫卯"}</div>
          </div>
          <div className="i-box">
            <div className="title">该组件数量：</div>
            <div className="attr">{data.amount + "件"}</div>
          </div>
        </div>
      );
    });
    return (
      <div className="cont-suite">
        {comNodes}
      </div>
    );
  }
});

module.exports = DetailContent;
