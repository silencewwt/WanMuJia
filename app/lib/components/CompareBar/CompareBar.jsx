'use strict';
require('./CompareBar.scss');

let React = require("react");
let reqwest = require("reqwest");
let utils = require("../../utils/utils.js");
let setCookie = utils.setCookie;
let getCookie = utils.getCookie;

const MOCK_ITEMS = [
  {
    id: 13826,
    image_url: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg',
    item: '二闷橱',
    price: 168000
  }, {
    id: 13851,
    image_url: 'http://static.wanmujia.com/images/item/51/8fd2b6a905998718475dc7247ef2b9bc/e46a0c76b5b4067acbf2361fba71daeb.jpg',
    item: '小叶檀梅花条案',
    price: 368000
  },
  {
    id: 13892,
    image_url: 'http://static.wanmujia.com/images/item/92/ea1dc35074d70be99f0cc54198b6bf74/3de87dd30c03d45d33175ffdb52ca458.jpg',
    item: '书架书架书架书架书架书架书架书架',
    price: 600000
  },
];

var CompareBar = React.createClass({
  getInitialState: function() {
    return {
      show: true,
      data: MOCK_ITEMS,
      errTip: null,
    };
  },
  show: function() {
    this.setState({show: true});
  },
  hide: function() {
    this.setState({show: false});
  },
  toggle: function() {
    this.setState({show: !this.state.show});
  },
  // 添加对比项，先判断时候套件，套件提示错误；
  // 再判断时候重复，如果重复提示错误；
  // 再判断对比项是否满了，满3件提示错误；
  // 添加到state.data，存cookie
  addItem: function(item) {
    this.show();
    if(item.is_suit) {
      this.setErrTip('套件不可对比，请选择单件商品对比～');
      return false;
    }
    for(let i = 0; i < this.state.data.length; i++) {
      if(this.state.data[i].id == item.id) {
        this.setErrTip('该商品已在对比栏，请选择其他商品添加对比哦！');
        return false;
      }
    }
    if(this.state.data.length == 3) {
      this.setErrTip('对比栏已满，你可以先删除烂内商品再添加哦！');
      return false;
    }
    let _data = this.state.data;
    _data.push(item);
    this.setState({data: _data});
    let _cookieStr =  getCookie("compareItems") || "";
    let _cookieArr = _cookieStr.split(',');
    let cookieArr = _cookieArr.push(item.id);
    let cookieStr = cookieArr.join(',');
    let now = new Date();
    setCookie('compareItems', cookieStr, now.setHours(now.getHours() + 30 * 24) , '/' );
  },
  // 删除对比项
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
    let _cookieStr =  getCookie("compareItems") || "";
    let _cookieArr = _cookieStr.split(',');
    if(_cookieArr[idNum] == id) {
      let cookieArr = _cookieArr.splice(idNum , 1);
      let cookieStr = cookieArr.join(',');
      let now = new Date();
      setCookie('compareItems', cookieStr, now.setHours(now.getHours() + 30 * 24) , '/' );
    }
  },
  // 删除所有
  deleteAll: function() {
    this.setState({data: []});
    let now = new Date();
    setCookie('compareItems', "", now.setHours(now.getHours() + 30 * 24) , '/' );
  },
  // 根据 cookie id 获取对比项数据
  getItem: function(id , num) {
    reqwest({
      url: "/",
      method: "get",
      data: {id: id},
      success: function(itemData) {
        let _data = this.state.data;
        _data[num] = itemData;
        this.setState({data: _data});
      }.bind(this)
    });
  },
  // 初始化获取cookie 获取数据
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
  setErrTip: function(err) {
    this.setState({errTip: err});
    setTimeout(function() {
      this.setState({errTip: null});
    }.bind(this) , 3000);
  },
  render: function() {
    return (
      <div className="compare-bar-wrap">
        <span className="compare-bar-btn" onClick={this.toggle}>对比</span>
        <div className={(this.state.show?"show ":"" )+ "compare-bar"}>
          <CompareBarHeader
            hide={this.hide}
          />
        <CompareBarContent
          data={this.state.data}
          delete={this.deleteItem}
          deleteAll={this.deleteAll}
        />
        </div>
      </div>
    );
  }
});

var CompareBarHeader = React.createClass({
  render: function() {
    return (
      <div className="cb-header">
        <h1>对比栏</h1>
        <div className="close-btn" onClick={this.props.hide}>隐藏</div>
      </div>
    );
  }
});

var CompareBarContent = React.createClass({
  render: function() {
    return (
      <div className="cb-content">
        <CompareBarItem num="1" data={this.props.data[0]} delete={this.props.delete} />
        <CompareBarItem num="2" data={this.props.data[1]} delete={this.props.delete} />
        <CompareBarItem num="3" data={this.props.data[2]} delete={this.props.delete} />
        <CompareBarOperation deleteAll={this.props.deleteAll} />
      </div>
    );
  }
});

var CompareBarItem = React.createClass({
  render: function() {
    if(!this.props.data) {
      return (
        <div className="cb-item null">
          <div className="num-box">
            {this.props.num}
          </div>
          <div className="null-tip">你还可以继续添加</div>
        </div>
      );
    } else {
      return (
        <div className="cb-item">
          <a href="#">
            <div className="pic">
              <img src={this.props.data.image_url} alt={this.props.data.item} />
            </div>
            <div className="detail">
              <h2 className="title">{this.props.data.item}</h2>
              <div className="price">{this.props.data.price/10000}万</div>
            </div>
          </a>
          <div className="delete"
            onClick={this.props.delete.bind(null, this.props.data.id)}>
            删除
          </div>
        </div>
      );
    }
  }
});

var CompareBarOperation = React.createClass({
  render: function() {
    return (
      <div className="cb-operation">
        <a className="compare-link" href="#">对比</a>
        <div className="delete-all" onClick={this.props.deleteAll}>清空对比栏</div>
      </div>
    );
  }
});

module.exports = CompareBar;
