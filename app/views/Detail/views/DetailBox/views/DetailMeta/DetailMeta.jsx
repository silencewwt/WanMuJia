'use strict';

require('./DetailMeta.scss');
let React = require('react');
let reqwest = require('reqwest');

let InfoSelectShop = require('./views/InfoSelectShop/InfoSelectShop.jsx');

var DetailMeta = React.createClass({
  render: function() {
    var data = this.props.data;
    return (
      <div className="d-meta">
        <ImgBox imgData={data.item.images} />
        <InfoBox
          data={data}
          mobile={this.props.mobile}
          addCompare={this.props.addCompare}
          toLogin={this.props.toLogin}
        />
      </div>
    );
  }
});

var ImgBox = React.createClass({
  getInitialState: function() {
    return {
      nowImg: null,
    };
  },
  getDefaultProps: function() {
    return {
      imgData: [],
    };
  },
  selectImg: function(img) {
    this.setState({nowImg: img});
  },
  render: function() {
    var imgsNode = this.props.imgData.map(function(src , idx) {
      if(idx > 3) return ;
      return (
        <img
          key={"img"+idx}
          src={src}
          onMouseOver={this.selectImg.bind(null,src)}
          onClick={this.selectImg.bind(null,src)}
        />
      );
    }.bind(this));
    return (
      <div className="img-box">
        <div className="show-img">
          <img src={this.state.nowImg||this.props.imgData[0]} />
        </div>
        <div className="slide-img">
          {imgsNode}
        </div>
      </div>
    );
  }
});

var InfoBox = React.createClass({
  render: function() {
    return (
      <div className="info-box">
        <div className="name">
          <h1>{this.props.data.item.item}</h1>
        </div>
        <div className="price">
          参考价格：
          <span className="price-num">{"￥"+this.props.data.item.price}</span>
        </div>

        <InfoButtonBox
          addCompare={this.props.addCompare}
          toLogin={this.props.toLogin}
          data={this.props.data}
          mobile={this.props.mobile}
        />

        <InfoSelectShop
          itemId={this.props.data.item.id}
          mobile={this.props.mobile}
          data={this.props.data.distributors}
        />

      </div>
    );
  }
});

var InfoButtonBox = React.createClass({
  getInitialState: function() {
    return {
      collected: false,
      cDisabled: false
    };
  },
  componentDidMount: function() {
    this.setState({collected: this.props.data.item.collected});
  },
  addCompare: function() {
    var item = this.props.data.item;
    var _item = {
      id: item.id,
      image_url: item.images[0],
      item: item.item,
      price: item.price,
      is_suite: item.is_suite,
    };
    this.props.addCompare(_item);
  },
  addCollect: function(method) {
    if(!this.props.mobile) {
      this.props.toLogin();
      return ;
    }
    this.setState({cDisabled: true});
    var id = this.props.data.item.id;
    reqwest({
      url: '/collection',
      method: method,
      data: {item: id},
      success: function(resp) {
        if(resp.success) {
          this.setState({cDisabled: false, collected: !this.state.collected});
        }
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="button-box">
        <button
          className={(this.state.collected?"disabled ":"") + "collect-btn btn"}
          disabled={this.state.cDisabled}
          onClick={this.addCollect.bind(null,this.state.collected?"delete":"post")}>
          {this.state.collected?"取消收藏":"收 藏"}
        </button>
        <button
          className="compare-btn btn"
          onClick={this.addCompare}>
          加入对比
        </button>
      </div>
    );
  }
});

module.exports = DetailMeta;
