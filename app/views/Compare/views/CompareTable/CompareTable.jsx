'use strict';

require('./CompareTable.scss');

let React = require('react');
let reqwest = require('reqwest');
let utils = require('../../../../lib/utils/utils');
let getCookie = utils.getCookie;
let setCookie = utils.setCookie;

var CompareTable = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      tip: null,
    };
  },
  setTip: function(tip) {
    this.setState({tip: tip});
    setTimeout(function() {
      this.setState({tip: null});
    }.bind(this) , 3400);
  },
  componentDidMount: function() {
    let _cookieStr =  getCookie("compareItems");
    if(!_cookieStr) {
      return ;
    }
    let idArr = _cookieStr.split(',');
    for(let i = 0; i < idArr.length; i++) {
      this.getItem(idArr[i] , i);
    }
  },
  getItem(id , num) {
    reqwest({
      url: "/item/"+id,
      method: "get",
      data: {format: "json"},
      success: function(itemData) {
        let _data = this.state.data;
        _data[num] = itemData;
        _data[num].id = id;
        this.setState({data: _data});
      }.bind(this)
    });
  },
  deleteItem: function(id) {
    var idNum;
    for(let i = 0; i < this.state.data.length; i++) {
      if(this.state.data[i].id == id) {
        idNum = i;
        break;
      }
    }
    var _data = this.state.data;
    _data.splice(idNum , 1);
    this.setState({data: _data});
    let _cookieStr =  getCookie("compareItems");
    let _cookieArr = _cookieStr?_cookieStr.split(','):[];
    if(_cookieArr[idNum] == id) {
      _cookieArr.splice(idNum , 1);
      let cookieStr = _cookieArr.join(',');
      let now = new Date();
      setCookie('compareItems', cookieStr, now.setHours(now.getHours() + 30 * 24) , '/' );
    }
  },
  collectItem: function(id) {
    if(this.props.logined) {
      reqwest({
        url: "/collection",
        method: "POST",
        data: {item: id},
        success: function(resp) {
          if(resp.success) {
            this.setTip("添加到收藏成功!");
          } else {
            this.setTip("添加到收藏失败~");
          }
        }.bind(this)
      });
    } else {
      this.props.toLogin();
    }
  },
  render: function() {
    return (
      <div className="compare-table">
        <div className="title">
          <h1>基本信息对比</h1>

          <div className="tip">{this.state.tip}</div>

        </div>
        <div className="tbody">
          <CompareTableThGroup />
          <CompareTableTdGroup data={this.state.data[0]} delete={this.deleteItem} collect={this.collectItem} />
          <CompareTableTdGroup data={this.state.data[1]} delete={this.deleteItem} collect={this.collectItem} />
          <CompareTableTdGroup data={this.state.data[2]} delete={this.deleteItem} collect={this.collectItem} />
        </div>
      </div>
    );
  }
});

var CompareTableThGroup = React.createClass({
  render: function() {
    return (
      <ul className="th-group">
        <li className="th th1">商品图片</li>
        <li className="th th2">指导价格</li>
        <li className="th th3">所属品牌</li>
        <li className="th th4">适用面积</li>
        <li className="th th5">商品尺寸</li>
        <li className="th th6">场景分类</li>
        <li className="th th7">商品种类</li>
        <li className="th th8">烘干工艺</li>
        <li className="th th9">外表面打磨砂纸</li>
        <li className="th th10">内表面打磨砂纸</li>
        <li className="th th11">雕刻工艺</li>
        <li className="th th12">涂饰工艺</li>
        <li className="th th13">装饰工艺</li>
        <li className="th th14">结构</li>
      </ul>
    );
  }
});

var CompareTableTdGroup = React.createClass({
  render: function() {
    let data = {};
    for(let key in this.props.data) {
      data[key] = utils.isArray(this.props.data[key])?this.props.data[key].join('、'):this.props.data[key];
    }
    var til = (<li className="td td1"></li>);
    if(data.item) {
      til = (
        <li className="td td1 til">
          <a target="_blank" href={"/item/" + data.id}>
            <img src={data.image_url} alt={data.item||""} />
            <div className="name">
              {data.item||""}
            </div>
          </a>
          <div className="delete-btn" onClick={this.props.delete.bind(null,data.id)}>删除</div>
          <div className="collect-btn" onClick={this.props.collect.bind(null,data.id)}>收藏</div>
        </li>
      );
    }
    return (
      <ul className="td-group">
        {til}
        <li className="td td2 price">{(data.price?"￥"+data.price/10000+"万":"")}</li>
        <li className="td td3">{data.brand||""}</li>
        <li className="td td4">{data.area?data.area+"平方米":""}</li>
        <li className="td td5">{data.size?data.size+" ｜ cm * cm * cm":""}</li>
        <li className="td td6">{data.scene||""}</li>
        <li className="td td7">{data.category||""}</li>
        <li className="td td8">{data.stove||""}</li>
        <li className="td td9">{data.outside_sand||""}</li>
        <li className="td td10">{data.inside_sand||""}</li>
        <li className="td td11">{data.carve||""}</li>
        <li className="td td12">{data.paint||""}</li>
        <li className="td td13">{data.decoration||""}</li>
        <li className="td td14">{data.item?data.tenon||"榫卯":""}</li>
      </ul>
    );
  }
});

module.exports = CompareTable;
